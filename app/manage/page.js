import KingFallback from '../components/kingFallback';
import { KingOnlySection } from '../components/ProtectedContent';

export default function ManagePage() {
  return (
    <div>
      <KingOnlySection fallback={<KingFallback />}>
        <h1>관리자 페이지</h1>
      </KingOnlySection>
    </div>
  );
}
