from openpyxl import Workbook

wb_write = Workbook()
dest_filename = '112.xlsx'

ws1 = wb_write.active

ws1.title = "sheet1"
ws1.append(["stkcd", "year", "avg"])

import sqlite3

conn = sqlite3.connect('test.db')
c = conn.cursor()
print ("数据库打开成功")

cursor = c.execute("select company_code, year, round(avg(age), 1) as avgs from COMPANY group by year, company_code")
for row in cursor:
    ws1.append([row[0], row[1], row[2]])

wb_write.save(filename = dest_filename)

print ("数据操作成功")
conn.close()