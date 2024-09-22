<p align="center">
<br />
    <img src="https://github.com/user-attachments/assets/713f1ebb-2927-4691-aedd-f363b600c355" width="400" alt=""/>
<br />
</p>
<p align="center"><strong style="font-size: 24px;">AI-powered Auditor for Solidity & Cairo Smart Contracts </strong></p>
<p align="center" style="display: flex; justify-content: center; align-items: center;">
    <span style="display: inline-flex; align-items: center; background-color: #1c1c1c; padding: 5px; border-radius: 6px;">
        <span style="margin: 0 10px; color: white; font-size: 14px;"></span>
         <a href="https://x.com/NethermindSec">
            <img src="https://github.com/user-attachments/assets/e39a568b-7f38-4c7e-ad2e-43c72ff6815a" style="height: 27px;"/>
        </a>
    </span>
</p>



## What is Gecko?
Gecko is an autonomous multi-agent AI auditor that combines LLM’s with custom security tools like fuzzers and static analysers to replicate a hacker's intuition and detect vulnerabilities in Solidity and Cairo smart contracts.

## Features
- [Custom GPT Vulnerability Research Engine](https://github.com/nkoorty/gecko-singapore/blob/main/backend/src/ai_engine.py)
- [Solidity Grammar Parser](https://github.com/OpenZeppelin/sgp)
- [Modified Caracal](https://github.com/crytic/caracal)
- [LLM powered Solidity Fuzzer](https://github.com/nkoorty/gecko-singapore/tree/main/backend/src/fuzz)

## Demo
<p align="center">
      <img src="https://github.com/user-attachments/assets/a41723a0-7580-41ed-86dd-11027938300f" alt="Gecko_Arch" width="50%" />
</p>





## Installation

Prerequisites:
- Open AI Key (gpt-4o-mini)
- PostgreSQL

1. Clone the Gecko repository:
   ```sh
   https://github.com/nkoorty/gecko-singapore
   ```

2. 

## Images
<p align="center">
    <img src=https://github.com/user-attachments/assets/ed23de00-e8ff-43b6-baa8-8e8cf8d3975c width=48%>
    <img src=https://github.com/user-attachments/assets/e94d64bc-9661-49c1-8e80-81ef9845e9aa width=48%>
    <img src=https://github.com/user-attachments/assets/b10f9b5b-c332-42ca-b61e-4004803280a3 width=48%>
</p>

## Results
Dataset based on scraped etherscan small [contracts](https://github.com/nkoorty/gecko-singapore/blob/main/dataset.txt)

<p align="center">
      <img src="https://github.com/user-attachments/assets/db479219-84b6-4f8d-988a-a5b35e2af1b8" alt="Results" width="75%" />
</p>


## Roadmap

## Team
- [JJ](https://www.linkedin.com/in/jeevan-jutla/): ex-Binance ex-Intellegence Security Researcher, interested in AI for offensive security
- [Artemiy](https://www.linkedin.com/in/artemiy-malyshau/): Imperial College London Graduate, ex-Austrian Gov.

## Attribution & Research
Based on research from:
- [LLM4FUZZ: Guided Fuzzing of Smart Contract with Large Language Models](https://arxiv.org/pdf/2401.11108)
- [Large Language Monkeys: Scaling Inference Compute with Repeated Sampling](https://arxiv.org/pdf/2407.21787v1)
- [CONFUZZIUS: A Data Dependency-Aware Hybrid Fuzzer for Smart Contracts](https://arxiv.org/pdf/2005.12156)

## Contributing & License
Help us build Gecko! Gecko is an open-source software licensed under the [MIT License](https://github.com/nkoorty/gecko-singapore/blob/main/LICENSE).
