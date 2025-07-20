/*******************************************************************
 * Angular still needs Zone.js unless you’ve opted into zone‑less
 * change detection. Import it here so the runtime can patch the
 * browser APIs it relies on.
 *******************************************************************/
import 'zone.js';          //  <── THIS FIXES NG0908
