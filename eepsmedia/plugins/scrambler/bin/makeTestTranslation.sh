#!/bin/sh
# Amends a strings file with a test pseudo-locale.
# The test locale is enclish strings with "XXX" prepended.
PROGNAME=`basename $0`
DIRNAME=`dirname $0`

STRINGS_FILE="${DIRNAME}/../src/strings/strings.json"
TEMP_FILE="/tmp/$PROGNAME.$$"
JQ="${DIRNAME}/../node_modules/node-jq/bin/jq"

cat "$STRINGS_FILE" |
  $JQ 'del(.test)' |
  $JQ '. + {"test": (."en"|with_entries(.value |= "XXX"+.))}' > $TEMP_FILE

mv $TEMP_FILE $STRINGS_FILE
