import { Link } from "react-router-dom";

/**
 * PlopUI link components accept `href`. This adapter lets them
 * drive React Router while keeping their sticker/link behaviour.
 */
export default function RouterLink({ href, ...props }) {
  return <Link to={href} {...props} />;
}
