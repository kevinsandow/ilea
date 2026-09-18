import { LeoAndLea } from '../components/Characters';
import { SpeakerButton } from '../components/SpeakerButton';

interface Props {
  child: string;
  onHome: () => void;
  onTeacher: () => void;
}

export function FinishScreen({ child, onHome, onTeacher }: Props) {
  const text = `Super, ${child}! Du hast alle Aufgaben geschafft. Vielen Dank fürs Mitmachen!`;
  return (
    <div className="finish">
      <div className="panel">
        <LeoAndLea size={130} />
        <div className="row" style={{ justifyContent: 'center' }}>
          <h1 style={{ margin: 0 }}>Geschafft!</h1>
          <SpeakerButton text={text} autoPlay />
        </div>
        <p style={{ fontSize: 20 }}>{text}</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <button type="button" className="bigbtn" onClick={onHome}>
            Zurück zum Start
          </button>
          <button type="button" className="bigbtn bigbtn--ghost" onClick={onTeacher}>
            Auswertung (Lehrkraft)
          </button>
        </div>
      </div>
    </div>
  );
}
