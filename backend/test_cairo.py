import os
import re
import json

def find_rust_functions(text, filename, hash):
    regex = r"((?:pub(?:\s*\([^)]*\))?\s+)?fn\s+\w+(?:<[^>]*>)?\s*\([^{]*\)(?:\s*->\s*[^{]*)?\s*\{)"
    matches = re.finditer(regex, text)
    functions = []
    lines = text.split('\n')
    line_starts = {i: sum(len(line) + 1 for line in lines[:i]) for i in range(len(lines))}

    function_bodies = []
    for match in matches:
        brace_count = 1
        function_body_start = match.start()
        inside_braces = True
        for i in range(match.end(), len(text)):
            if text[i] == '{':
                brace_count += 1
            elif text[i] == '}':
                brace_count -= 1

            if inside_braces and brace_count == 0:
                function_body_end = i + 1
                function_bodies.append(text[function_body_start:function_body_end])
                break

    contract_code = "\n".join(function_bodies).strip()

    for match in re.finditer(regex, text):
        start_line_number = next(i for i, pos in line_starts.items() if pos > match.start()) - 1
        brace_count = 1
        function_body_start = match.start()
        inside_braces = True

        for i in range(match.end(), len(text)):
            if text[i] == '{':
                brace_count += 1
            elif text[i] == '}':
                brace_count -= 1
            if inside_braces and brace_count == 0:
                function_body_end = i + 1
                end_line_number = next((i for i, pos in line_starts.items() if pos > function_body_end), len(lines)) - 1
                function_body = text[function_body_start:function_body_end]
                function_body_lines = function_body.count('\n') + 1
                visibility = 'public' if 'pub' in match.group(1) else 'private'
                functions.append({
                    'type': 'FunctionDefinition',
                    'name': 'special_'+re.search(r'\bfn\s+(\w+)', match.group(1)).group(1),  # Extract function name from match
                    'start_line': start_line_number + 1,
                    'end_line': end_line_number,
                    'offset_start': 0,
                    'offset_end': 0,
                    'content': "",
                    'contract_name': filename.replace('.rs','_rust'+str(hash)),
                    'contract_code': "",
                    'modifiers': [],
                    'stateMutability': None,
                    'returnParameters': None,
                    'visibility': visibility,
                    'node_count': function_body_lines
                })
                break

    return functions

def process_rust_file(file_path, hash_value):
    with open(file_path, 'r', encoding='utf-8') as file:
        rust_code = file.read()
    filename = os.path.basename(file_path)
    functions = find_rust_functions(rust_code, filename, hash_value)
    
    return functions
def process_rust_folder(folder_path, hash_value):
    all_functions = []
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.endswith('.cairo'):
                file_path = os.path.join(root, file)
                print(f"Processing files：{file_path}")
                functions = process_rust_file(file_path, hash_value)
                all_functions.extend(functions)
                print(f"\n{file_path} The parsing result is: ")
                for func in functions:
                    print(json.dumps(func, indent=2))
                    print("-" * 50)
                print(f"exist{file_path} found{len(functions)} function. ")
    return all_functions

def test_find_rust_functions(folder_path, hash_value):
    if not os.path.isdir(folder_path):
        print(f"error：'{folder_path}' Not a valid folder path.")
        return
    print(f"Working with folders ：{folder_path}")
    all_functions = process_rust_folder(folder_path, hash_value)
    print(f"\nTotal found {len(all_functions)} function.")
    return all_functions

if __name__ == "__main__":

    FOLDER_PATH = "src/dataset/agent-v1-c4/nameservice" 
    HASH_VALUE = 12345  
    found_functions = test_find_rust_functions(FOLDER_PATH, HASH_VALUE)