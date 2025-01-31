import {useNavigate} from '@remix-run/react';
import {isExternalLink} from '~/utils/isExternalLink';

export const BackButton = ({
  className = 'clip-hover uppercase',
  children = 'Back',
}) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    const canGoBack = window.history.state.idx !== 0;
    if (!canGoBack || isExternalLink(document.referrer)) {
      navigate('/');
      return;
    }
    navigate(-1);
  };

  return (
    <button onClick={handleGoBack} className={className}>
      {children}
    </button>
  );
};
