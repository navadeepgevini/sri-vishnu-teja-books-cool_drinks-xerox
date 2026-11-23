import base64

with open(r'P:\e-commerce sites\web\public\logo.png', 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img" aria-label="Sri Vishnu Teja Logo">
  <image width="512" height="512" href="data:image/png;base64,{b64}"/>
</svg>
'''

with open(r'P:\e-commerce sites\web\public\logo.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content)
print("Updated logo.svg successfully!")
