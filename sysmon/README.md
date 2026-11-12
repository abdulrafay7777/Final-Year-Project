# Sysmon Configuration & Binaries

This directory contains Microsoft Sysinternals Sysmon binaries and configuration for Argus endpoint telemetry collection.

## Files
- `Sysmon.exe` / `Sysmon64.exe` / `Sysmon64a.exe`: Microsoft Sysinternals Sysmon executables.
- `sysmonconfig.xml`: Tailored Sysmon configuration capturing process creation, high-entropy file operations, registry modifications, and network connections.
- `Eula.txt`: Sysinternals Software License Terms.

## Installation

Run PowerShell or Command Prompt as Administrator:

```cmd
# Install Sysmon with Argus configuration
Sysmon64.exe -i sysmonconfig.xml -accepteula

# Update existing Sysmon configuration
Sysmon64.exe -c sysmonconfig.xml

# Check Sysmon service status
sc query Sysmon64
```

