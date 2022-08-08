#!/bin/sh
PROGNAME=`basename $0`
DIRNAME=`dirname $0`

STRINGS_FILE="./src/utilities/strings.json"
TEMP_FILE=/tmp/$PROGNAME.$$
JQ=${DIRNAME}/../node_modules/node-jq/bin/jq

cat $STRINGS_FILE |
  $JQ 'del(.test)' |
  $JQ '. + {"test": (."en-US"|with_entries(.value |= "XXX"+.))}' > $TEMP_FILE

mv $TEMP_FILE $STRINGS_FILE
