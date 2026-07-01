const MusicPlayer = {
  audioEl: null,
  currentTrack: null,
  isPlaying: false,
  tracks: {
    '晴天': 'assets/audio/晴天.mp3',
    '青花瓷': 'assets/audio/青花瓷.mp3'
  },

  init() {
    this.audioEl = document.getElementById('bg-audio');
    this.audioEl.volume = 0.5;
  },

  play(name) {
    const trackPath = this.tracks[name];
    if (!trackPath) {
      return false;
    }

    if (this.currentTrack === name && this.isPlaying) {
      return true;
    }

    this.audioEl.src = trackPath;
    this.audioEl.loop = true;
    this.audioEl.play().then(() => {
      this.isPlaying = true;
      this.currentTrack = name;
    }).catch(e => {
      console.error('播放失败:', e);
    });

    this.currentTrack = name;
    this.isPlaying = true;
    return true;
  },

  pause() {
    this.audioEl.pause();
    this.isPlaying = false;
  },

  stop() {
    this.audioEl.pause();
    this.audioEl.currentTime = 0;
    this.isPlaying = false;
    this.currentTrack = null;
  },

  setVolume(vol) {
    const volume = Math.max(0, Math.min(1, vol));
    this.audioEl.volume = volume;
  },

  listTracks() {
    return Object.keys(this.tracks);
  }
};

CommandRegistry.register({
  name: 'music',
  alias: ['m'],
  description: '音乐播放器',
  usage: 'music [play <名称>|pause|stop|volume <0-100>]',
  handler: async (args) => {
    if (args.length === 0) {
      const status = MusicPlayer.isPlaying ? '播放中' : '已暂停';
      const track = MusicPlayer.currentTrack || '无';
      Terminal.println('当前状态:', 'info');
      Terminal.println(`  状态: ${status}`, '');
      Terminal.println(`  当前: ${track}`, '');
      Terminal.println(`  音量: ${Math.round(MusicPlayer.audioEl.volume * 100)}%`, '');
      Terminal.println('');
      Terminal.println('可用音乐:', 'info');
      MusicPlayer.listTracks().forEach(name => {
        Terminal.println(`  ${name}`, '');
      });
      Terminal.println('');
      Terminal.println('用法: music play <名称>  |  music pause  |  music stop  |  music volume <0-100>', 'dim');
      return;
    }

    const subCmd = args[0].toLowerCase();

    if (subCmd === 'play') {
      if (args.length < 2) {
        if (MusicPlayer.currentTrack) {
          MusicPlayer.audioEl.play();
          MusicPlayer.isPlaying = true;
          Terminal.println(`继续播放: ${MusicPlayer.currentTrack}`, 'success');
        } else {
          Terminal.println('请指定要播放的音乐', 'error');
          Terminal.println(`可用: ${MusicPlayer.listTracks().join(', ')}`, 'dim');
        }
        return;
      }
      const name = args.slice(1).join(' ');
      const success = MusicPlayer.play(name);
      if (success) {
        Terminal.println(`正在播放: ${name}`, 'success');
      } else {
        Terminal.println(`找不到音乐: ${name}`, 'error');
        Terminal.println(`可用: ${MusicPlayer.listTracks().join(', ')}`, 'dim');
      }
      return;
    }

    if (subCmd === 'pause') {
      MusicPlayer.pause();
      Terminal.println('已暂停', 'success');
      return;
    }

    if (subCmd === 'stop') {
      MusicPlayer.stop();
      Terminal.println('已停止', 'success');
      return;
    }

    if (subCmd === 'list' || subCmd === 'ls') {
      Terminal.println('可用音乐:', 'info');
      MusicPlayer.listTracks().forEach(name => {
        Terminal.println(`  ${name}`, '');
      });
      return;
    }

    if (subCmd === 'volume' || subCmd === 'vol') {
      if (args.length < 2) {
        Terminal.println(`当前音量: ${Math.round(MusicPlayer.audioEl.volume * 100)}%`, 'info');
        return;
      }
      const vol = parseFloat(args[1]);
      if (isNaN(vol) || vol < 0 || vol > 100) {
        Terminal.println('音量必须在 0-100 之间', 'error');
        return;
      }
      MusicPlayer.setVolume(vol / 100);
      Terminal.println(`音量已设置为 ${vol}%`, 'success');
      return;
    }

    Terminal.println(`未知子命令: ${subCmd}`, 'error');
  }
});
