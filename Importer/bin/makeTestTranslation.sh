#!/bin/sh
PROGNAME=`basename $0`

STRINGS_FILE="./modules/strings.json"
TEMP_FILE=/tmp/$PROGNAME.$$

cat $STRINGS_FILE |
  jq 'del(.test)' |
  jq '. + {"test": (."en-US"|with_entries(.value |= "XXX"+.))}' > $TEMP_FILE

mv $TEMP_FILE $STRINGS_FILE
