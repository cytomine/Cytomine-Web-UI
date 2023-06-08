#!/bin/sh

####
# This file generates a meta-prefixes.json file defining what properties that should
# be considered as metadata. A property is considered image metadata if the property 
# key prefix matches on the the values of the meta-prefixes json object.
####

### Generated with chat gpt, then refined manually

output_file="${PUBLIC_FOLDER:-/app}/meta-prefixes.json"

if [[ -z "$METADATA_PREFIXES" ]]; then
  echo "No metadata prefixes provided, creating an empty $output_file."
  echo "{}" > $output_file
  exit
fi 

# Read properties from environment variable and convert to JSON
properties_to_json() {
  local output=""
  local key=""
  local value=""

  while IFS='=' read -r key value; do
    # Skip empty or commented lines
    if [ -n "$key" ] && ! echo "$key" | grep -qE '^#' ; then
      # Escape special characters in the value
      value=$(printf "%s" "$value" | sed 's/\\/\\\\/g; s/"/\\"/g; s/`/\\`/g; s/\\$/\\\$/g; s/\\n/\\\\n/g; s/\\r/\\\\r/g; s/\\t/\\\\t/g')

      # Append key-value pair to JSON output
      if [ -z "$output" ]; then
        output="\"${key}\": \"${value}\""
      else
        output="${output},\"${key}\": \"${value}\""
      fi
    fi
  done <<-EOF
$METADATA_PREFIXES
EOF

  # Remove trailing comma and new line
  output=$(printf "%s" "$output" | sed '$s/,$//')
  output="{$output}"

  printf "%s" "$output"
}

# Convert properties file to JSON
json_data=$(properties_to_json)

# Write JSON data to output file
echo "$json_data" > "$output_file"

echo "Metadata prefixes saved in JSON file '$output_file'."
