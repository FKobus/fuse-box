import { lazy } from '../../../utils/lazy';
import { Button } from './button';

const LazyButton = lazy(() => import('./lazyButton'));

export { Button, LazyButton };

export default null;
