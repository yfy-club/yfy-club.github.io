# 背景音乐放这里

页面按固定路径找文件，**文件名不能改**：

```
public/audio/bgm.ogg    主格式（Opus）
public/audio/bgm.mp3    兜底（老 Safari）
```

两个都不在时，导航条上的「声音」开关自动不出现——不报错，也不留死按钮。
所以现在这个目录是空的，页面照常工作。

## 放之前

1. 音源渠道与授权筛选看 [../../docs/music-sources.md](../../docs/music-sources.md)。
   **游戏原声、扒站音频、来路不明的二创一律不行。**
2. 转码，单文件 ≤ 2.5MB：

   ```bash
   ffmpeg -i 原曲.wav -c:a libopus -b:a 96k -vbr on public/audio/bgm.ogg
   ffmpeg -i 原曲.wav -c:a libmp3lame -b:a 128k public/audio/bgm.mp3
   ```

3. 若许可证要求署名，填 [../../docs/CREDITS.md](../../docs/CREDITS.md)，
   并把 `src/data/credits.ts` 的 `BGM_CREDIT` 改成一行字符串，页脚会自动多出那一行。

曲子本身要能被无视：无人声、无强鼓点、BPM 70–90、循环点自然。它是背景不是主角。
