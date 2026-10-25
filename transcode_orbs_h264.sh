#!/usr/bin/env bash
# Make H.264 copies of every Mood Orb loop in Firebase Storage (visuals/v3/*_720_hevc.mp4 ->
# *_720_h264.mp4). Today only the HEVC copies exist, so Android and many browsers can't play the
# orbs and fall back to a still poster or the offline loop.
#
# Run in Google Cloud Shell (project escape-self-care-505618):
#   bash transcode_orbs_h264.sh
# Then set ORB_HAS_H264 = true in EscapeKit.tsx.
set -euo pipefail
BUCKET="gs://escape-self-care-505618.firebasestorage.app/visuals/v3"
command -v ffmpeg >/dev/null || sudo apt-get install -y -qq ffmpeg
WORK="$(mktemp -d)"; cd "$WORK"
gcloud storage ls "$BUCKET/*_720_hevc.mp4" | while read -r SRC; do
  NAME="$(basename "$SRC" _720_hevc.mp4)"
  DST="$BUCKET/${NAME}_720_h264.mp4"
  if gcloud storage ls "$DST" >/dev/null 2>&1; then echo "skip  $NAME (h264 exists)"; continue; fi
  echo "make  $NAME"
  gcloud storage cp -q "$SRC" in.mp4
  ffmpeg -v error -y -i in.mp4 -an -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 23 -preset slow -movflags +faststart out.mp4
  gcloud storage cp -q --content-type=video/mp4 --cache-control="public,max-age=31536000" out.mp4 "$DST"
  rm -f in.mp4 out.mp4
done
echo "done"
