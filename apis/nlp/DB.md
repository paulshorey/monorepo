username = doadmin
password = sp8lls786zoj9xj7
host = nlp-do-user-1354070-0.b.db.ondigitalocean.com
port = 25060
database = defaultdb
sslmode = require

private network host = private-nlp-do-user-1354070-0.b.db.ondigitalocean.com

restore from local file
PGPASSWORD=sp8lls786zoj9xj7 pg_restore -U doadmin -h nlp-do-user-1354070-0.b.db.ondigitalocean.com -p 25060 -d defaultdb /Users/admin/Downloads/db-backup.sql
