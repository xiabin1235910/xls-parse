from openpyxl import Workbook

wb_write = Workbook()
dest_filename = '113.xlsx'

ws1 = wb_write.active

ws1.title = "sheet1"
ws1.append(["stkcd", "year", "count(part)", "part"])

import sqlite3

conn = sqlite3.connect('test.db')
c = conn.cursor()
print ("数据库打开成功")

cursor = c.execute("select company_code, year, count(part), part from COMPANY group by year, company_code, part")
for row in cursor:
    ws1.append([row[0], row[1], row[2], row[3]])

wb_write.save(filename = dest_filename)

print ("数据操作成功")
conn.close()