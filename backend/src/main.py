import ast
import os
import time
import audit_config
from ai_engine import *
from project import ProjectAudit
from library.dataset_utils import load_dataset, Project
from planning import PlanningV1, PlanningV2
from prompts import prompts
from sqlalchemy import create_engine
from dao import CacheManager, ProjectTaskMgr

def scan_project(project, db_engine, use_vectorRule = False):
    llm = createGptApi(audit_config, "pezzo", prompts, CacheManager(db_engine))
    project_audit = ProjectAudit(project.id, project.path, db_engine)
    project_audit.parse(project.white_files, project.white_functions)
    project_taskmgr = ProjectTaskMgr(project.id, db_engine) 
    if use_vectorRule:
        planning = PlanningV2(llm, project_audit, project_taskmgr)
    else:
        planning = PlanningV1(llm, project_audit)
    
    project_taskmgr = ProjectTaskMgr(project.id, db_engine)
    engine = AiEngine(llm, planning, project_taskmgr)
    engine.do_planning()
    engine.do_scan()

def rescan_project_with_gpt4(project_id, db_engine):
    llm = createGptApi(audit_config, "chatgpt", prompts, None, model=MODEL_GPT4)
    project_taskmgr = ProjectTaskMgr(project_id, db_engine)
    engine = AiEngine(llm, None, project_taskmgr)
    engine.rescan_with_gpt4()

def check_function_vul(func_body, engine, is_gpt4 = False):
    model = MODEL_GPT4 if is_gpt4 else MODEL_GPT3
    llm = createGptApi(audit_config, "pezzo", prompts, CacheManager(engine))
    project_taskmgr = ProjectTaskMgr(project.id, engine)
    engine = AiEngine(llm, None, project_taskmgr)
    result = engine.check_function_vul()
    print(result)

def generate_json(output_path,project_id):
    project_taskmgr = ProjectTaskMgr(project_id, engine)
    entities=project_taskmgr.query_task_by_project_id(project.id)
    json_results = {
        "success": True,
        "results": [],
    }

    for entity in entities:
        if float(entity.similarity_with_rule) < 0.82:
            continue
        if '"result": "no"' in str(entity.description):
            continue
        line_info_list = entity.business_flow_lines  
        line_info_str = line_info_list.strip('"\'') 
        line_info_set = ast.literal_eval(line_info_str)
        line_info_list = list(line_info_set)
        line_info_tuples = [ast.literal_eval(item) for item in line_info_list]
        affected_files_list = []
        for start_line, end_line in line_info_tuples:
            affected_file = {
                "filePath": entity.relative_file_path, 
                "range": {
                    "start": {"line": int(start_line)},
                    "end": {"line": int(end_line)}
                },
                "highlights": []
            }
            affected_files_list.append(affected_file)

        result_obj = {
            "code": "logic-error",
            "severity": "HIGH",
            "title": entity.title,  
            "description": entity.description,  
            "recommendation": entity.recommendation,
            "affectedFiles": affected_files_list
        }
        json_results["results"].append(result_obj)

    json_string = json.dumps(json_results, indent=4)

    file_name = output_path 
    with open(file_name, 'w') as file:
        file.write(json_string)
def show_antlr_use():
    from sgp.utilities.contract_extractor import extract_function_from_solidity
    function_body = extract_function_from_solidity('divUp', 'test.sol')

if __name__ == '__main__':
    switch_production_or_test = 'test' 
    if switch_production_or_test == 'test':
        start_time=time.time()
        db_url_from = os.getenv("DATABASE_URL")
        engine = create_engine(db_url_from)
        dataset_base = "./src/dataset/agent-v1-c4"
        projects = load_dataset(dataset_base)
        project_id = 'reentrancybug'
        project_path = ''
        project = Project(project_id, projects[project_id])
        cmd = 'detect_vul'
        if cmd == 'detect_vul':
            scan_project(project, engine, True)
            content = ''' '''
            rule = ''' '''
            check_function_vul(content, engine, True) 
        elif cmd == 'check_vul_if_positive':
            content = ''' '''
            rule = ''' '''
            check_function_vul(content, engine, True)
        end_time=time.time()
        print("Total time:",end_time-start_time)
        generate_json("output.json",project_id)