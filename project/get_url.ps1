$process = Start-Process cmd -ArgumentList "/c npx -y cloudflared tunnel --url http://localhost:8080" -RedirectStandardOutput "tunnel_out.txt" -RedirectStandardError "tunnel_err.txt" -PassThru
Start-Sleep -Seconds 15
Get-Content "tunnel_err.txt" | Select-String "trycloudflare.com" | Out-File -FilePath "final_url.txt"
