from dotenv import load_dotenv
import os
import pymysql
import json

load_dotenv()
password = os.getenv('PASSWORD')

def get_db_connection():
    return pymysql.connect(
        host='localhost',
        user='root',
        password=password,
        database='meetings'
    )

try:
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute('USE meetings;')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS meetings(
            meeting_name VARCHAR(100) NOT NULL
            description VARCHAR(500) 
            creator VARCHAR(100) NOT NULL UNIQUE
            meeting_date_time DATETIME
            room_code VARCHAR(8) NOT NULL UNIQUE
        );
    ''')

    cursor.execute('')

except pymysql.MySQLError as e:
    json.dumps({"message": f"An error occurred: {e}"}), 500
finally:
    cursor.close()
    connection.close()
