import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agents.orchestrator import run_orchestrator

if __name__ == '__main__':
    result = run_orchestrator()