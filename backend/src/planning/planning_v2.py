import random
import time
import requests
from library.chatgpt_api2 import *
from dao.entity import Project_Task
import os, sys
from tqdm import tqdm
import pickle
from library.vectorutils import get_top_k_similar, find_elbow_point, plot_elbow_curve
from library.embedding_api import get_embbedding
import re


class PlanningV2(object):
    def __init__(self, llm, project,taskmgr) -> None:
        self.llm = llm
        self.project = project
        self.taskmgr=taskmgr
        self.scan_list_for_larget_context=[]

    def ask_openai_for_business_flow(self,function_name,contract_code_without_comment):
        prompt=f"""
        Based on the code above, analyze the business flows that start with the {function_name} function, consisting of multiple function calls. The analysis should adhere to the following requirements:
        1. only output the one sub-business flows, and must start from {function_name}.
        2. The output business flows should only involve the list of functions of the contract itself (ignoring calls to other contracts or interfaces, as well as events).
        3. After step-by-step analysis, output one result in JSON format, with the structure: {{"{function_name}":[function1,function2,function3....]}}
        4. The business flows must include all involved functions without any omissions

        """
        question=f"""

        {contract_code_without_comment}
        \n
        {prompt}

        """
        api_base= os.getenv('OPENAI_API_BASE', 'api.openai.com') 
        api_key = os.getenv('OPENAI_API_KEY') 
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        data = {
            "model": os.getenv('BUSINESS_FLOW_MODEL_ID'),
            "response_format": { "type": "json_object" },
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful assistant designed to output JSON."
                },
                {
                    "role": "user",
                    "content": question
                }
            ]
        }
        response = requests.post(f'https://{api_base}/v1/chat/completions', headers=headers, json=data)
        response_josn = response.json()
        if 'choices' not in response_josn:
            return ''
        return response_josn['choices'][0]['message']['content']
    
    def extract_filtered_functions(self, json_string):
        """
        Extracts function names from a JSON string. For function names and keys containing a period,
        only the substring after the last period is included. The key is included as the first
        element in the returned list, processed in the same way as the functions.

        :param json_string: A string representation of a JSON object.
        :return: A list of the processed key followed by its corresponding filtered function names.
        """
        json_string=json_string.replace("```json",'"')
        data = json.loads(json_string)
        result_list = []
        for key, functions in data.items():
            result_list.append(key)
            filtered_functions = [function for function in functions]
            result_list.extend(filtered_functions)
        return list(set(result_list))
    
    def extract_and_concatenate_functions_content(self,function_lists, contract_info):
        """
        Extracts the content of functions based on a given function list and contract info,
        and concatenates them into a single string.
        
        :param function_lists: A list of function names.
        :param contract_info: A dictionary representing a single contract's information, including its functions.
        :return: A string that concatenates all the function contents from the function list.
        """
        concatenated_content = ""
        functions = contract_info.get("functions", [])
        function_dict = {str(function["name"]).split(".")[1]: function for function in functions}
        for function_name in function_lists:
            function_content = function_dict.get(function_name, {}).get("content")
            if function_content is not None:
                concatenated_content += function_content + "\n"

        return concatenated_content.strip()
    def extract_results(self,text):
        if text is None:
            return []
        regex = r'\{.*?\}'
        matches = re.findall(regex, text)
        json_objects = []
        for match in matches:
            try:
                json_obj = json.loads(match)
                json_objects.append(json_obj)
            except json.JSONDecodeError:
                pass 

        return json_objects

    def get_vul_from_code(self,content,keyconcept):
        response=''
        varaibles = {
            "content": content,
            "keyconcept": keyconcept
        }
        response = self.llm.completion("getVulV41205", varaibles)
        return response
    
    def merge_and_sort_rulesets(self,high, medium):
        combined_ruleset = high + medium
        combined_ruleset.sort(key=lambda x: x['sim_score'], reverse=True)
        return combined_ruleset
    
    def decode_business_flow_list_from_response(self, response):
        pattern = r'({\s*\"[a-zA-Z0-9_]+\"\s*:\s*\[[^\]]*\]\s*})'
        matches = re.findall(pattern, response)
        unique_functions = set()
        for match in matches:
            try:
                json_obj = json.loads(match)
                for key in json_obj:
                    for function in json_obj[key]:
                        unique_functions.add(function)
            except json.JSONDecodeError:
                pass
        return list(unique_functions)
    
    def identify_contexts(self, functions_to_check):
        """
        Identify sub-calls and parent-calls for each function in functions_to_check,
        only including calls that are not in the same contract.
        Returns a dictionary with function names as keys and their sub-calls and parent-calls as values,
        including the content of the sub-calls and parent-calls.
        """
        contexts = {}
        calls = {function["name"]: {"sub_calls": set(), "parent_calls": set()} for function in functions_to_check}

        for function in functions_to_check:
            function_name = function["name"]
            function_content = function["content"]
            function_contract_name = function["contract_name"]

            for other_function in functions_to_check:
                other_function_name = other_function["name"]
                other_function_content = other_function["content"]
                other_function_contract_name = other_function["contract_name"]

                if function_contract_name != other_function_contract_name:
                    if function_name.split(".")[1] in other_function_content:
                        calls[function_name]["parent_calls"].add((other_function_name, other_function_content))

                    if other_function_name.split(".")[1] in function_content:
                        calls[function_name]["sub_calls"].add((other_function_name, other_function_content))
        
        for function_name, call_data in calls.items():
            contexts[function_name] = {
                "sub_calls": [{"name": name, "content": content} for name, content in call_data["sub_calls"]],
                "parent_calls": [{"name": name, "content": content} for name, content in call_data["parent_calls"]]
            }

        return contexts


    def get_all_business_flow(self,functions_to_check):
        """
        Extracts all business flows for a list of functions.
        :param functions_to_check: A list of function names to extract business flows for.
        :return: A dictionary containing all business flows for each contract.
        The keys of the dictionary are the contract names, and the values are dictionaries containing the business flows for each public/external function.
        """
        from library.sgp.utilities.contract_extractor import group_functions_by_contract
        from library.sgp.utilities.contract_extractor import check_function_if_public_or_external
        from library.sgp.utilities.contract_extractor import check_function_if_view_or_pure

        grouped_functions = group_functions_by_contract(functions_to_check)
        contexts = self.identify_contexts(functions_to_check)
        all_business_flow = {}
        all_business_flow_line={}
        all_business_flow_context = {}
        print("grouped contract count:",len(grouped_functions))
        
        for contract_info in grouped_functions:
            print("——————————————————————— 🦎 processing contract_info:",contract_info['contract_name'],"—————————————————————————")
            contract_name = contract_info['contract_name']
            functions = contract_info['functions']
            contract_code_without_comments = contract_info['contract_code_without_comment']  # Assuming this is the correct key
            all_business_flow[contract_name] = {}
            all_business_flow_line[contract_name]={}
            all_business_flow_context[contract_name] = {}
            if "_rust" in str(contract_name) or contract_name is None:
                all_public_external_function_names = [
                    function['name'].split(".")[1] for function in functions
                ]
            elif "_cairo" in str(contract_name) or contract_name is None:
                all_public_external_function_names = [
                    function['name'].split(".")[1] for function in functions if function['visibility']=='public'
                ]
            else:
                all_public_external_function_names = [
                    function['name'].split(".")[1] for function in functions
                    if check_function_if_public_or_external(function['content'])
                ]
            print("all_public_external_function_names count:",len(all_public_external_function_names))
            if len(self.scan_list_for_larget_context)>0 and contract_name not in self.scan_list_for_larget_context:
                continue
            print("----------------- 🦎 asking openai for business flow-----------------")
            for public_external_function_name in all_public_external_function_names:
                print("***public_external_function_name***:",public_external_function_name)
                if "_python" in str(contract_name) and len(all_public_external_function_names)==1:
                    key = all_public_external_function_names[0]
                    data = {key: all_public_external_function_names}
                    business_flow_list = json.dumps(data)
                else:
                    try:
                        business_flow_list = self.ask_openai_for_business_flow(public_external_function_name, contract_code_without_comments)
                    except Exception as e:
                        business_flow_list=[]
                if len(business_flow_list)==0:
                    continue
                try:
                    function_lists = self.extract_filtered_functions(business_flow_list)
                except Exception as e:
                    print(e)  
                print("business_flow_list:",function_lists)

                def get_function_structure(functions, function_name):
                    for func in functions:
                        if func['name'] == function_name:
                            return func
                    return None
                line_info_list = []
                for function in function_lists:
                    if str(function)=="-1":
                        continue
                    function_name_to_search=contract_name+"."+function
                    function_structure=get_function_structure(functions, function_name_to_search)
                    if function_structure is not None:
                        start_line=function_structure['start_line']
                        end_line=function_structure['end_line']
                        line_info_list.append((start_line, end_line))
                ask_business_flow_code = self.extract_and_concatenate_functions_content(function_lists, contract_info)
                extended_flow_code = ""
                for function in function_lists:
                    context = contexts.get(contract_name + "." + function, {})
                    parent_calls = context.get("parent_calls", [])
                    sub_calls = context.get("sub_calls", [])
                    for call in parent_calls + sub_calls:
                        extended_flow_code += call["content"] + "\n"
                all_business_flow_context[contract_name][public_external_function_name] = extended_flow_code.strip()
                all_business_flow[contract_name][public_external_function_name] = ask_business_flow_code
                all_business_flow_line[contract_name][public_external_function_name] = line_info_list
        return all_business_flow,all_business_flow_line,all_business_flow_context    
    
    def search_business_flow(self,all_business_flow, all_business_flow_line,all_business_flow_context, function_name, contract_name):
        """
        Search for the business flow code based on a function name and contract name.

        :param all_business_flow: The dictionary containing all business flows.
        :param function_name: The name of the function to search for.
        :param contract_name: The name of the contract where the function is located.
        :return: The business flow code if found, or a message indicating it doesn't exist.
        """
        if contract_name in all_business_flow:
            contract_flows = all_business_flow[contract_name]
            contract_flows_line=all_business_flow_line[contract_name]
            contract_flows_context=all_business_flow_context[contract_name]
            if function_name in contract_flows:
                return contract_flows[function_name],contract_flows_line[function_name],contract_flows_context[function_name]
            else:
                return "not found","",""
        else:
            return "not found","",""
        
    def do_planning(self):
        tasks = []
        print("Begin do planning...")
        switch_function_code=eval(os.getenv('SWITCH_FUNCTION_CODE','False'))
        switch_business_code=eval(os.getenv('SWITCH_BUSINESS_CODE','True'))
        tasks = self.taskmgr.get_task_list_by_id(self.project.project_id)
        if len(tasks) > 0:
            return 
        for function in self.project.functions_to_check:
            name=function['name']
            if "test" in name:
                self.project.functions_to_check.remove(function)

        if switch_business_code:
            all_business_flow,all_business_flow_line,all_business_flow_context=self.get_all_business_flow(self.project.functions_to_check)                    
        
        for function in tqdm(self.project.functions_to_check, desc="Finding project rules"):
            
            name = function['name']
            content = function['content']
            contract_code=function['contract_code']
            contract_name=function['contract_name']
            task_count = 0
            print(f"————————Processing function: {name}————————")
            if switch_business_code:
                business_flow_code,line_info_list,other_contract_context=self.search_business_flow(all_business_flow, all_business_flow_line,all_business_flow_context, name.split(".")[1], contract_name)
                if business_flow_code != "not found":
                    for i in range(int(os.getenv('BUSINESS_FLOW_COUNT', 1))):
                        task = Project_Task(
                            project_id=self.project.project_id,
                            name=name,
                            content=content,
                            keyword=str(random.random()),
                            business_type='',
                            sub_business_type='',
                            function_type='',
                            rule='',
                            result='',
                            result_gpt4='',
                            score='',
                            category='',
                            contract_code=contract_code,
                            risklevel='',
                            similarity_with_rule='',
                            description='',
                            start_line=function['start_line'],
                            end_line=function['end_line'],
                            relative_file_path=function['relative_file_path'],
                            absolute_file_path=function['absolute_file_path'],
                            recommendation='',
                            title='',
                            business_flow_code=str(business_flow_code)+"\n"+str(content),
                            business_flow_lines=line_info_list,
                            business_flow_context=other_contract_context,
                            if_business_flow_scan=1  
                        )
                        self.taskmgr.add_task_in_one(task)
                        task_count += 1
            
            if switch_function_code:
                for i in range(int(os.getenv('BUSINESS_FLOW_COUNT', 1))):
                    task = Project_Task(
                        project_id=self.project.project_id,
                        name=name,
                        content=content,
                        keyword=str(random.random()),
                        business_type='',
                        sub_business_type='',
                        function_type='',
                        rule='',
                        result='',
                        result_gpt4='',
                        score='',
                        category='',
                        contract_code=contract_code,
                        risklevel='',
                        similarity_with_rule='',
                        description='',
                        start_line=function['start_line'],
                        end_line=function['end_line'],
                        relative_file_path=function['relative_file_path'],
                        absolute_file_path=function['absolute_file_path'],
                        recommendation='',
                        title='',
                        business_flow_code='',
                        business_flow_lines='',
                        business_flow_context='',
                        if_business_flow_scan=0  
                    )
                    self.taskmgr.add_task_in_one(task)
                    task_count += 1

    