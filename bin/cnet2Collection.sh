#!/bin/bash

BACKEND=mongo
TIMESTAMP=$(date "+%s")
DATABASE="compranet-intermediary"
PROXY_URL="https://excel2json.herokuapp.com"

URLS=(
  https://upcp.funcionpublica.gob.mx/descargas/Contratos2017.zip
  https://upcp.funcionpublica.gob.mx/descargas/Contratos2016.zip
  https://upcp.funcionpublica.gob.mx/descargas/Contratos2015.zip
  https://compranetinfo.funcionpublica.gob.mx/descargas/cnet/Contratos2014.zip
  https://compranetinfo.funcionpublica.gob.mx/descargas/cnet/Contratos2013.zip
  https://compranetinfo.funcionpublica.gob.mx/descargas/cnet/Contratos2010_2012.zip
)

# randomize list to increase likely hood of importing new documents on reruns
IFS=$'\n' SORTED_URLS=($(shuf <<<"${URLS[*]}"))
unset IFS

for url in "${SORTED_URLS[@]}";
do
  echo "streaming ${PROXY_URL}/${url} to ${BACKEND}"
  stream2db --backend ${BACKEND} \
    --id hash \
    --db ${DATABASE} \
    --type compranet \
    ${PROXY_URL}/${url}
done
