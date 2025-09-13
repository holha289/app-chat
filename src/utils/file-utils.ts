import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

function guessExt(type: 'photo' | 'video', srcPath: string) {
  if (type === 'photo') return srcPath.endsWith('.jpg') || srcPath.endsWith('.jpeg') ? '.jpg' : '.jpg';
  return srcPath.endsWith('.mp4') ? '.mp4' : '.mp4'; // ép về mp4 để chắc ăn
}

async function persistLocalFile(captured: { path: string; type: 'photo'|'video' }) {
  const src = captured.path.startsWith('file://') ? captured.path : `file://${captured.path}`;
  const filename = `media_${Date.now()}${guessExt(captured.type, src)}`;
  const dir = Platform.OS === 'android' ? RNFS.CachesDirectoryPath : RNFS.DocumentDirectoryPath; 
  // hoặc dùng DocumentDirectoryPath trên cả 2 nền tảng nếu muốn bền vững hơn
  const dest = `${RNFS.DocumentDirectoryPath}/${filename}`;

  // copy (hoặc moveFile nếu muốn)
  await RNFS.copyFile(src, dest);
  return `file://${dest}`;
}

export { persistLocalFile };