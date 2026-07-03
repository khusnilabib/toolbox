#!/bin/bash
# Test all 23 tools systematically
# Each test: open page, fill input, click Run, verify output

cd /home/z/my-project

test_tool() {
  local url=$1
  local input_text=$2
  local expected=$3
  local tool_name=$4
  
  agent-browser open "$url" 2>&1 | head -1
  sleep 4
  
  # Get textbox ref
  TB=$(agent-browser snapshot -i 2>&1 | grep "textbox" | head -1 | grep -oP 'ref=e\K[0-9]+')
  
  if [ -z "$TB" ]; then
    echo "FAIL: $tool_name — no textbox found"
    return
  fi
  
  # Fill input
  agent-browser click "@e$TB" 2>&1 > /dev/null
  sleep 1
  agent-browser type "@e$TB" "$input_text" 2>&1 > /dev/null
  sleep 1
  
  # Get Run button ref
  RUN=$(agent-browser snapshot -i 2>&1 | grep -E 'button.*Run|button.*Generate|button.*Encode|button.*Decode|button.*Convert|button.*Format' | head -1 | grep -oP 'ref=e\K[0-9]+')
  
  if [ -z "$RUN" ]; then
    echo "FAIL: $tool_name — no Run button found"
    return
  fi
  
  # Click Run
  agent-browser click "@e$RUN" 2>&1 > /dev/null
  sleep 4
  
  # Check result
  result=$(agent-browser eval "document.body.innerText.includes('$expected')" 2>&1 | head -1)
  
  if [ "$result" = "true" ]; then
    echo "PASS: $tool_name"
  else
    # Get error if any
    err=$(agent-browser eval "document.querySelector('[role=alert]')?.textContent?.slice(0,80) || 'no error shown'" 2>&1 | head -1)
    echo "FAIL: $tool_name — expected '$expected' — alert: $err"
  fi
}

echo "=== TEXT TOOLS ==="
test_tool "http://localhost:3000/tools/text/case-converter" "Hello World" "HELLO WORLD" "Case Converter"
test_tool "http://localhost:3000/tools/text/word-counter" "The quick brown fox" "4" "Word Counter"
test_tool "http://localhost:3000/tools/text/remove-duplicate-lines" "apple
apple
banana" "banana" "Remove Duplicate Lines"
test_tool "http://localhost:3000/tools/text/sort-lines" "banana
apple
cherry" "apple" "Sort Lines"

echo ""
echo "=== DEVELOPER TOOLS ==="
test_tool "http://localhost:3000/tools/developer/base64-encoder" "Hello" "SGVsbG8=" "Base64 Encoder"
test_tool "http://localhost:3000/tools/developer/url-encoder" "hello world" "hello%20world" "URL Encoder"
test_tool "http://localhost:3000/tools/developer/uuid-generator" "" "" "UUID Generator"
test_tool "http://localhost:3000/tools/developer/json-formatter" '{"a":1}' "a" "JSON Formatter"
test_tool "http://localhost:3000/tools/developer/hash-generator" "test" "" "Hash Generator"
