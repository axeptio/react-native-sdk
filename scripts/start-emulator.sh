#!/bin/bash

# List all available Android Virtual Devices (AVDs)
echo "Available Android emulators:"
AVDS=($(emulator -list-avds))

if [ ${#AVDS[@]} -eq 0 ]; then
  echo "No emulators found. Create one using Android Studio's AVD Manager."
  exit 1
fi

for i in "${!AVDS[@]}"; do
  echo "$((i+1)). ${AVDS[$i]}"
done

# Prompt user to select an emulator
read -p "Enter emulator number or name: " CHOICE

if [[ "$CHOICE" =~ ^[0-9]+$ ]]; then
  # If the user entered a number, adjust for zero-based array
  IDX=$((CHOICE-1))
  if [ $IDX -lt 0 ] || [ $IDX -ge ${#AVDS[@]} ]; then
    echo "Invalid number selected."
    exit 1
  fi
  EMU_NAME="${AVDS[$IDX]}"
else
  # If the user entered a name, check it exists
  if [[ ! " ${AVDS[@]} " =~ " $CHOICE " ]]; then
    echo "Emulator '$CHOICE' not found."
    exit 1
  fi
  EMU_NAME="$CHOICE"
fi

# Check if emulator is already running
if adb devices | grep -q emulator; then
  echo "An emulator is already running."
else
  echo "Starting emulator: $EMU_NAME"
  emulator -avd "$EMU_NAME" &
  echo "Emulator launched. Waiting for device..."
  adb wait-for-device
  echo "Emulator $EMU_NAME is ready!"
fi
