#cwd=$(dirname $(realpath $0))
#sudo -i -u postgres
###
# DROP SCHEMA IF EXISTS data CASCADE;
# CREATE SCHEMA data AUTHORIZATION nodejs;
#

psql --host "localhost" --port "5432" --username "postgres" --dbname "words" -c "\dn;DROP SCHEMA IF EXISTS data CASCADE;CREATE SCHEMA data AUTHORIZATION nodejs;"

pg_restore --host "localhost" --port "5432" --username "postgres" --dbname "words" --verbose --schema "data" "/tmp/data.sql"

