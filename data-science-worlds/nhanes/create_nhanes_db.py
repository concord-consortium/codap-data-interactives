
import pandas as pd
from sqlalchemy import create_engine, text

user = 'root' # Enter your MySQL username here
pw = '' # Enter your MySQL password here

# Database configuration
db_config = {
    'user': user,
    'password': pw,
    'host': 'localhost',
    'port': '3306',
    'database': 'nhanes'
}


# Function to create a database engine and ensure the database exists
def create_db_engine(db_config):
    user = db_config['user']
    password = db_config['password']
    host = db_config['host']
    port = db_config['port']
    database = db_config['database']
    # Connect without specifying a database to issue the CREATE DATABASE command
    engine_without_db = create_engine(f'mysql+mysqlconnector://{user}:{password}@{host}:{port}/')
    with engine_without_db.connect() as conn:
        conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {database}"))
    # Return an engine connected to the specified database
    engine_with_db = create_engine(f'mysql+mysqlconnector://{user}:{password}@{host}:{port}/{database}')
    return engine_with_db

# Create the engine and ensure the database exists
engine = create_db_engine(db_config)

# List of XPT files
xpt_files = ['./xpt_data/P_BIOPRO.XPT', './xpt_data/P_BMX.XPT', './xpt_data/P_BPXO.XPT', './xpt_data/P_DEMO.XPT'] # Add more file paths as needed

# Process each XPT file to create a table in the database
for file_path in xpt_files:
    df = pd.read_sas(file_path)
    # Derive table name from file name (adjust as needed)
    table_name = file_path.split('/')[-1].split('.')[0]
    df.to_sql(table_name, con=engine, if_exists='replace', index=False)
    print(f"Data from {file_path} inserted into table {table_name} in database {db_config['database']}.")
