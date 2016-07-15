/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/* eslint-disable no-var, prefer-arrow-callback */
/* global sourceMappedStackTrace, document */

// Fixup stack traces, using this approach: https://gist.github.com/guncha/f45ceef6d483c384290a
(function() {

   jasmine.getEnv().addReporter( { jasmineDone: fixStackTraces } );

   function fixStackTraces() {
      try {
         var traces = document.querySelectorAll( '.jasmine-stack-trace' );
         [].slice.call( traces ).forEach( fixStackTrace );
      }
      catch(e) { /* ok, just an unsupported browser */ }
   }

   function fixStackTrace( node ) {
      sourceMappedStackTrace.mapStackTrace( node.textContent, function( stack ) {
         var prevNode = node.previousSibling;
         var prevNodeText = prevNode.getAttribute( 'title' ) || prevNode.textContent;
         node.textContent = prevNodeText + '\n' + stack.join( '\n' );
      } );
   }

})();
