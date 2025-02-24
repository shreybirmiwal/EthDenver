import json

# Input and output file names
input_file = 'ASCII.txt'
output_file = 'output.txt'

# Read the input file and store lines in a list
with open(input_file, 'r') as file:
    lines = file.readlines()

# Remove any trailing newlines and convert to JSON-compatible format
lines = [line.rstrip('\n') for line in lines]

# Create a JSON array of the lines
json_array = json.dumps(lines, indent=2)

# Write the JSON array to the output file
with open(output_file, 'w') as file:
    file.write(json_array)

print(f"Processing complete. Output written to {output_file}")
