#!/bin/bash
# يولّد الدفعة التالية من الصور (يعمل في المقدمة، يولد حتى 8 صور أو 8 دقائق ثم يخرج)
cd /home/z/my-project
RAW=public/raw
mkdir -p "$RAW"
MAX_FILES=${1:-8}
MAX_SECS=${2:-480}
START=$(date +%s)
MADE=0

PT="vertical movie poster art, cinematic composition, dramatic lighting, rich colors, highly detailed digital painting, no text, no letters, no words, no watermark"
BT="ultra wide cinematic movie still, anamorphic, moody atmosphere, high detail, no text, no letters, no watermark"

declare -A PROMPTS
PROMPTS[poster-big-buck-bunny]="cheerful chubby grey rabbit standing in a sunny green meadow forest with a butterfly on its nose, 3D animation family movie style, vibrant spring colors, $PT"
PROMPTS[poster-sintel]="young red haired warrior woman holding a sword searching for her dragon, epic fantasy snowy mountain landscape, emotional and melancholic, $PT"
PROMPTS[poster-tears-of-steel]="futuristic battle on a city bridge with giant humanoid robots, soldiers and sparks, cinematic science fiction action, teal and orange grading, $PT"
PROMPTS[poster-elephants-dream]="two men walking through a surreal infinite machine world, bizarre mechanical architecture and endless corridors, dark surreal fantasy, $PT"
PROMPTS[poster-bipbop-showcase]="abstract technology showcase, glowing colorful geometric shapes and light beams over dark background, digital broadcast test signal aesthetic, retro futuristic, $PT"
PROMPTS[poster-open-worlds]="magical portal connecting four fantasy worlds: desert dunes, futuristic city, snowy mountains and ocean storm, epic anthology poster, $PT"
PROMPTS[poster-thil-al-sahra]="mysterious lone figure in a dark cloak walking across giant sand dunes at twilight casting a very long dramatic shadow, suspense thriller mood, deep amber and dark shadows, $PT"
PROMPTS[poster-layali-alger]="warm evening in old algiers white town by the mediterranean sea, string lights on a rooftop terrace, family gathering silhouettes, cozy intimate drama, $PT"
PROMPTS[poster-qilat-al-riyah]="majestic ancient desert fortress on a rocky cliff at golden hour, armored warriors with banners, approaching sandstorm, epic historical drama, $PT"
PROMPTS[poster-al-wisam-al-maksour]="special forces soldier silhouette emerging from smoke and fire, broken medal emblem, intense action thriller, $PT"
PROMPTS[poster-tareeq-al-hareer]="camel caravan of merchants on the ancient silk road through high mountains at sunset, adventure epic, golden light, $PT"
PROMPTS[poster-hams-al-janoub]="couple standing apart in a blooming orange blossom field at dawn, romantic drama, soft golden morning light, delicate, $PT"
PROMPTS[poster-saif-al-fajr]="anime key visual, young swordsman with glowing emerald katana in dynamic action pose at dawn, cherry blossom petals, dramatic sky, japanese animation style, $PT"
PROMPTS[poster-madinat-al-nujum]="anime key visual, futuristic city under a giant purple nebula sky with floating trains and glass towers, science fiction animation, $PT"
PROMPTS[poster-rihlat-al-akhira]="anime key visual, young girl and old rusty robot sitting in a train carriage traveling through an endless starfield, emotional farewell, animation movie, $PT"
PROMPTS[poster-the-last-signal]="lone astronaut receiving a mysterious glowing green beacon signal on a dark alien planet, science fiction mystery, deep space above, $PT"
PROMPTS[poster-midnight-runners]="two runners sprinting through neon lit rainy city streets at night being chased, motion blur, thriller, dramatic backlight, $PT"
PROMPTS[poster-echoes-of-tomorrow]="woman facing a ghostly holographic duplicate of herself, mystery drama, dark room with green glow, science fiction, $PT"
PROMPTS[backdrop-thil-al-sahra]="vast desert dunes at twilight, tiny lone cloaked figure walking, enormous long shadow, dark suspense, deep amber gold and dark green color grading, $BT"
PROMPTS[backdrop-saif-al-fajr]="anime cinematic, young swordsman with glowing emerald katana standing on a cliff at dawn facing a giant creature silhouette, cherry blossom petals in wind, orange and green sky, $BT"
PROMPTS[backdrop-tears-of-steel]="futuristic battle scene on a city bridge at night, giant robots, smoke and laser fire, cinematic teal and orange grading, $BT"
PROMPTS[backdrop-sintel]="young red haired warrior woman with a sword overlooking a snowy mountain valley, small flying dragon silhouette in distance, epic fantasy, $BT"

ORDER=(
  poster-thil-al-sahra backdrop-thil-al-sahra
  poster-saif-al-fajr backdrop-saif-al-fajr
  poster-tears-of-steel backdrop-tears-of-steel
  poster-sintel backdrop-sintel
  poster-big-buck-bunny poster-elephants-dream poster-bipbop-showcase poster-open-worlds
  poster-layali-alger poster-qilat-al-riyah poster-al-wisam-al-maksour poster-tareeq-al-hareer
  poster-hams-al-janoub poster-madinat-al-nujum poster-rihlat-al-akhira poster-the-last-signal
  poster-midnight-runners poster-echoes-of-tomorrow
)

for name in "${ORDER[@]}"; do
  out="$RAW/$name.png"
  if [ -s "$out" ]; then continue; fi
  if [ "$MADE" -ge "$MAX_FILES" ]; then echo "LIMIT_FILES ($MADE)"; break; fi
  ELAPSED=$(( $(date +%s) - START ))
  if [ "$ELAPSED" -ge "$MAX_SECS" ]; then echo "LIMIT_TIME (${ELAPSED}s)"; break; fi

  if [[ "$name" == backdrop-* ]]; then SIZE=1344x768; else SIZE=768x1344; fi
  echo "GEN $name ..."
  if timeout 160 z-ai image -p "${PROMPTS[$name]}" -o "$out" -s "$SIZE" >/dev/null 2>&1 && [ -s "$out" ]; then
    echo "OK  $name"
    MADE=$((MADE+1))
  else
    echo "FAIL $name"
    rm -f "$out"
  fi
done

echo "=== batch done: made=$MADE total_files=$(ls $RAW | wc -l) ==="
