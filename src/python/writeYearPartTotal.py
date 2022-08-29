from openpyxl import Workbook

wb_write = Workbook()
dest_filename = '114.xlsx'

ws1 = wb_write.active

ws1.title = "sheet1"
ws1.append(["stkcd", "year", "part", "partcount", "companycount"])

import sqlite3

conn = sqlite3.connect('test.db')
c = conn.cursor()
print ("数据库打开成功")

cursor = c.execute('''
    select t1.company_code, t1.year, part, count(1) as partcount, companycount
    from COMPANY t1
    inner join (select company_code,year,count(1) as companycount
                from COMPANY
                group by company_code,year) t2
    on t1.company_code=t2.company_code
    and t1.year=t2.year
    group by t1.company_code,t1.year,part
''')
for row in cursor:
    ws1.append([row[0], row[1], row[2], row[3], row[4]])

wb_write.save(filename = dest_filename)

print ("数据操作成功")
conn.close()