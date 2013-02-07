sudo -u postgres dropdb sslc_dataagg
sudo -u postgres createdb -O klp -E UTF8 sslc_dataagg
sudo -u postgres psql -d sslc_dataagg -c "CREATE EXTENSION dblink"
sudo -u postgres createlang plpgsql sslc_dataagg 
psql -U klp -d sslc_dataagg -f sslc_dataagg.sql
