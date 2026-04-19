import os
import sys

# Ensure the backend directory is in the sys.path so tests can import modules directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))
