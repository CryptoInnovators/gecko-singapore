
from library.sgp.sgp_parser import get_antlr_parsing
from library.parsing.callgraph import CallGraph
import os
import re

from sgp.utilities.contract_extractor import extract_state_variables_from_code
from .project_settings import FILE_PARTIAL_WHITE_LIST, PATH_PARTIAL_WHITE_LIST, PATH_WHITE_LIST, OPENZEPPELIN_CONTRACTS,OPENZEPPELIN_FUNCTIONS

class Function(dict):
    def __init__(self, file, contract, func):
        self.file = file
        self.contract = contract
        self.update(func)
        
def parse_project_cg(project_path):
    cg = CallGraph(project_path)
    
    function_list = []
    for file, contract, func in cg.functions_iterator():
        func_text = cg.get_function_src(file, func)
        f = Function(file, contract, func)
        f['name'] = contract['name'] + '.' + func['name']
        f['content'] = func_text
        function_list.append(f)
    function_list = [result for result in function_list if result['kind'] == 'function']
    return function_list

def is_path_in_white_list(haystack, white_list, partial):
    if partial:
        for item in white_list:
            if item in haystack:
                return True
    else:
        for p in haystack.split("/"):
            ds = filter(lambda x: x == p, white_list)
            if len(list(ds)) > 0:
                return True
    return False
            

class BaseProjectFilter(object):

    def __init__(self, white_files = [], white_functions = []):
        self.white_files = white_files
        self.white_functions = white_functions
        pass

    def filter_file(self, path, filename):
        if not (filename.endswith(".sol") or filename.endswith(".rs") or filename.endswith(".py") or filename.endswith(".move") or filename.endswith(".cairo") or filename.endswith(".tact") or filename.endswith(".fc")) or filename.endswith(".t.sol"):
            return True
        if len(self.white_files) > 0:
            return not any(os.path.basename(filename) in white_file for white_file in self.white_files)
        if len(self.white_files) > 0:
            return os.path.basename(filename) not in self.white_files
        return False

    def check_function_code_if_statevar_assign(self, function_code,contract_code):
        state_vars=extract_state_variables_from_code(contract_code)
        nodes = function_code.split(';')
        for node in nodes:
            if '=' in node:
                left_side = node.split('=')[0].strip()
                for var in state_vars:
                    if re.search(r'\b' + re.escape(var) + r'\b', left_side):
                        return True
        return False
    def filter_contract(self, function):
        if '_cairo' in function["name"]:
            return False
        if str(function["contract_name"]).startswith("I") and function["contract_name"][1].isupper():
            print("function ", function['name'], " skipped for interface contract")
            return True
        if "test" in str(function["name"]).lower():
            print("function ", function['name'], " skipped for test function")
            return True
        if "function init" in str(function["content"]).lower() or "function initialize" in str(function["content"]).lower() or "constructor(" in str(function["content"]).lower() or "receive()" in str(function["content"]).lower() or "fallback()" in str(function["content"]).lower():
            print("function ", function['name'], " skipped for constructor")
            return True
        return False
    
    def filter_functions(self, function):
        if len(self.white_functions) == 0:
            return False
        return function['name'] not in self.white_functions

def parse_project(project_path, project_filter = None):
    if project_filter is None:
        project_filter = BaseProjectFilter([], [])
    ignore_folders = set()
    if os.getenv('IGNORE_FOLDERS'):
        ignore_folders = set(os.getenv('IGNORE_FOLDERS').split(','))
    ignore_folders.add('.git')
    all_results = []
    for dirpath, dirs, files in os.walk(project_path):
        dirs[:] = [d for d in dirs if d not in ignore_folders]
        for file in files:
            to_scan = not project_filter.filter_file(dirpath, file)
            sol_file = os.path.join(dirpath, file)
            absolute_path = os.path.abspath(sol_file)  
            print("parsing file: ", sol_file, " " if to_scan else "[skipped]")
            if to_scan:
                results = get_antlr_parsing(sol_file)
                for result in results:
                    result['relative_file_path'] = sol_file
                    result['absolute_file_path'] = absolute_path
                all_results.extend(results)
    functions = [result for result in all_results if result['type'] == 'FunctionDefinition']
    fs = []
    for func in functions:
        name = func['name'][8:]
        func['name'] = "%s.%s" % (func['contract_name'], name)
        fs.append(func)
    fs_filtered = fs[:]
    fs_filtered = [func for func in fs_filtered if not project_filter.filter_contract(func)]
    fs_filtered = [func for func in fs_filtered if not project_filter.filter_functions(func)]
    return fs, fs_filtered 

if __name__ == '__main__':
    from library.dataset_utils import load_dataset
    dataset_base = "../../dataset/agent-v1-c4"
    projects = load_dataset(dataset_base)
    project = projects['whalefall']
    project_path = os.path.join(project['base_path'], project['path'])
    white_files, white_functions = project.get('files', []), project.get('functions', [])
    parser_filter = BaseProjectFilter(white_files, white_functions)
    functions, functions_to_check = parse_project(project_path, parser_filter)
    print(functions_to_check)