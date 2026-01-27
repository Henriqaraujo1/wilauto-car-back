#!/bin/bash

#caminnho para o arquivo de backup
DB_BACKUP=/docker-entrypoint-initdb.d/dbmigration.sql


#restaurar o banco de dados
psql -U $POSTGRES_USER -d $POSTGRES_DB -f $DB_BACKUP