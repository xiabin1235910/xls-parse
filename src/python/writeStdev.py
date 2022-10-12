from openpyxl import Workbook
import math

wb_write = Workbook()
dest_filename = '115.xlsx'

ws1 = wb_write.active

ws1.title = "sheet1"
ws1.append(["stkcd", "year", "stdev"])

import sqlite3

conn = sqlite3.connect('test.db')
c = conn.cursor()
print ("数据库打开成功")

cursor = c.execute('''
    select company_code, year, sum(ce)/count(1)
    from (
    select a.company_code, a.year, age, avgs, age-avgs, (age-avgs)*(age-avgs) ce 
    from COMPANY a
    inner join (select company_code, year, round(avg(age), 1) as avgs from COMPANY group by year, company_code) b
    on a.company_code=b.company_code
    and a.year=b.year) detail group by company_code, year
''')
for row in cursor:
    ws1.append([row[0], row[1], math.sqrt(row[2])])

wb_write.save(filename = dest_filename)

print ("数据操作成功")
conn.close()