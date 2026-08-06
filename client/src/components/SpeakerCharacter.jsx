import AssetImage from './AssetImage.jsx';

export default function SpeakerCharacter({ speakerId, speaker }) {
  const name = speaker?.name || 'Pak Restu';
  const emoji = speaker?.emoji || '🧑‍🌾';
  const assetName = speakerId === 'narrator' ? 'narrator' : speakerId;

  return (
    <div className="relative flex shrink-0 items-end justify-center self-end">
      <AssetImage
        name={assetName}
        alt={name}
        className="h-72 w-40 md:h-88 md:w-56 object-contain object-bottom filter drop-shadow-lg"
        fallback={
          <div className="flex h-64 w-36 md:h-80 md:w-52 flex-col items-center justify-end p-3">
            <span className="text-7xl drop-shadow-lg md:text-8xl">{emoji}</span>
          </div>
        }
      />
    </div>
  );
}
