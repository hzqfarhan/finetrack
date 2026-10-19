from pathlib import Path
import re,html
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,PageBreak,Table,TableStyle,KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader
from PIL import Image,ImageDraw
import pypdfium2 as pdfium
root=Path.cwd()
for name,file in [('Arial','arial.ttf'),('Arial-Bold','arialbd.ttf'),('Arial-Italic','ariali.ttf')]: pdfmetrics.registerFont(TTFont(name,str(Path('C:/Windows/Fonts')/file)))
pdfmetrics.registerFontFamily('Arial',normal='Arial',bold='Arial-Bold',italic='Arial-Italic',boldItalic='Arial-Bold')
green=colors.HexColor('#007934'); muted=colors.HexColor('#607268')
styles={
 'body':ParagraphStyle('body',fontName='Arial',fontSize=10.5,leading=15,spaceAfter=9,textColor=colors.HexColor('#24372b')),
 'spoken':ParagraphStyle('spoken',fontName='Arial',fontSize=12,leading=17,spaceAfter=12,textColor=colors.HexColor('#15291b')),
 'h1':ParagraphStyle('h1',fontName='Arial-Bold',fontSize=27,leading=32,textColor=green,spaceAfter=14),
 'h2':ParagraphStyle('h2',fontName='Arial-Bold',fontSize=19,leading=24,textColor=green,spaceAfter=16),
 'h3':ParagraphStyle('h3',fontName='Arial-Bold',fontSize=14,leading=19,textColor=green,spaceAfter=7,keepWithNext=True),
 'meta':ParagraphStyle('meta',fontName='Arial-Bold',fontSize=9.5,leading=14,textColor=green,spaceAfter=8,keepWithNext=True),
 'action':ParagraphStyle('action',fontName='Arial-Italic',fontSize=9.5,leading=14,textColor=muted,spaceAfter=9),
 'cell':ParagraphStyle('cell',fontName='Arial',fontSize=9.5,leading=13,textColor=colors.HexColor('#20382a')),
 'headcell':ParagraphStyle('headcell',fontName='Arial-Bold',fontSize=9.5,leading=13,textColor=colors.white),
}
def clean(t):
 return t.replace('—','-').replace('–','-').replace('‑','-').replace('→','to')
def markup(t):
 t=html.escape(clean(t))
 t=re.sub(r'\[([^\]]+)\]\((https?://[^)]+)\)',r'<a href="\2" color="#007934"><u>\1</u></a>',t)
 t=re.sub(r'\*\*(.*?)\*\*',r'<b>\1</b>',t)
 return t.replace('`','')
def p(t,style='body'):return Paragraph(markup(t),styles[style])
def table(rows,widths):
 data=[[p(c,'headcell' if i==0 else 'cell') for c in row] for i,row in enumerate(rows)]
 t=Table(data,colWidths=widths,repeatRows=1,hAlign='LEFT')
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),green),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.HexColor('#eff6f1'),colors.white]),('LINEBELOW',(0,1),(-1,-1),.4,colors.HexColor('#d8e5dc'))]))
 return t
text=(root/'output/FineTrack-Duo-Haziq-and-Musyriqul-Script.md').read_text(encoding='utf-8')
intro,rest=text.split('## Slide-by-slide speaking script',1)
slide_text,appendix=rest.split('## Rehearsal and slide alignment notes',1)
blocks=re.split(r'(?=### Slide \d+)',slide_text.strip())
slides={int(re.search(r'### Slide (\d+)',b).group(1)):b for b in blocks if b.strip()}
def parse(lines):
 out=[];i=0
 while i<len(lines):
  line=lines[i].strip()
  if not line:i+=1;continue
  if line.startswith('|'):
   rows=[]
   while i<len(lines) and lines[i].strip().startswith('|'):
    cells=[c.strip() for c in lines[i].strip().strip('|').split('|')]
    if not all(re.match(r'^[-: ]+$',c) for c in cells): rows.append(cells)
    i+=1
   out.append(table(rows,[120,86,293]));out.append(Spacer(1,12));continue
  if line.startswith('# '):out.append(p(line[2:],'h1'))
  elif line.startswith('## '):out.append(p(line[3:],'h2'))
  elif line.startswith('### '):out.append(p(line[4:],'h3'))
  elif line.startswith('>'):
   if line[1:].strip():out.append(p(line[1:].strip(),'spoken'))
  elif line.startswith('**') and line.endswith('**'):out.append(p(line,'meta'))
  elif line.startswith('Action:'):out.append(p(line,'action'))
  elif line.startswith('- '):out.append(p('• '+line[2:]))
  else:out.append(p(line))
  i+=1
 return out
story=parse(intro.splitlines())
# Pages follow natural rehearsal groups. No spoken paragraph is split across pages.
for group in [[1,2,3],[4,5,6,7,8],[9,10,11,12],[13,14,15,16,17],[18,19,20,21]]:
 story.append(PageBreak())
 story.append(p('Speaking script','h2'))
 for n in group:
  story.append(KeepTogether(parse(slides[n].splitlines())))
  story.append(Spacer(1,9))
# Demo gets a full readable dialogue page after a short instruction page only if needed.
story.append(PageBreak());story.extend(parse(slides[22].splitlines()))
story.append(PageBreak());story.append(p('Closing the presentation','h2'))
for n in [23,24,25]:story.append(KeepTogether(parse(slides[n].splitlines())));story.append(Spacer(1,12))
sections=re.split(r'(?=## )','## Rehearsal and slide alignment notes'+appendix)
for section in sections:
 if section.strip():story.append(PageBreak());story.extend(parse(section.splitlines()))
out=root/'output/pdf/FineTrack-Duo-Presentation-Script.pdf'
def footer(c,doc):
 c.setStrokeColor(colors.HexColor('#d8e5dc'));c.line(48,44,547,44)
 c.setFillColor(muted);c.setFont('Arial',8)
 c.drawString(48,30,'FINETRACK DUO  /  HAZIQ FARHAN + MUSYRIQUL AMIN')
 c.drawRightString(547,30,str(doc.page))
 c.setFillColor(green);c.rect(48,800,34,3,fill=1,stroke=0)
doc=SimpleDocTemplate(str(out),pagesize=A4,rightMargin=48,leftMargin=48,topMargin=55,bottomMargin=58,title='FineTrack Duo - Presentation Script',author='Haziq Farhan and Musyriqul Amin')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
r=PdfReader(out);full='\n'.join(pg.extract_text() for pg in r.pages)
assert all(re.search(r'Slide '+str(n)+r'\b',full) for n in range(1,26))
print('PDF:',out,'Pages:',len(r.pages))
for i,pg in enumerate(r.pages):print(i+1,len(pg.extract_text()),pg.extract_text().splitlines()[2:4])
pdf=pdfium.PdfDocument(str(out));thumbs=[]
for i in range(len(pdf)):
 im=pdf[i].render(scale=1.3).to_pil().convert('RGB');im.save(root/f'tmp/pdfs/page-{i+1}.png');im.thumbnail((310,440));thumbs.append(im)
for offset in range(0,len(thumbs),6):
 sheet=Image.new('RGB',(960,940),'#ccd5ce');draw=ImageDraw.Draw(sheet)
 for k,im in enumerate(thumbs[offset:offset+6]):
  x=(k%3)*320;y=(k//3)*470;draw.text((x+10,y+5),f'Page {offset+k+1}',fill='black');sheet.paste(im,(x+5,y+25))
 sheet.save(root/f'tmp/pdfs/review-{offset//6}.png')
