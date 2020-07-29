Copy-Item -Force index_template.html index.html
Copy-Item -Force status_off_template.json status.json
$file = Get-Item index.html
$file.LastWriteTime = (Get-Date)
$file = Get-Item status.json
$file.LastWriteTime = (Get-Date)
