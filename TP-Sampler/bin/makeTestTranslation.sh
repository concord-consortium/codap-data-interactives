#!/bin/sh
PROGNAME=`basename $0`
DIRNAME=`dirname $0`

STRINGS_FILE="$DIRNAME/../src/strings.json"
TEMP_FILE=/tmp/$PROGNAME.$$

cat $STRINGS_FILE |
  jq 'del(.test)' |
  jq '. + {"test": (."en-us"|with_entries(.value |= "XXX"+.))}' > $TEMP_FILE

mv $TEMP_FILE $STRINGS_FILE
