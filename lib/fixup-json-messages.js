/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/* eslint-disable no-var, prefer-arrow-callback */
/* global jsondiffpatch, document, console */

// Fixup stack traces, using this approach: https://gist.github.com/guncha/f45ceef6d483c384290a
(function() {

   jasmine.getEnv().addReporter( { jasmineDone: fixJsonMessages } );

   function fixJsonMessages() {
      var resultMessages = document.querySelectorAll( '.jasmine-result-message' );
      [].slice.call( resultMessages )
         .filter( function( node ) {
            return ( /Expected / ).test( node.textContent );
         } )
         .forEach( fixMessage );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function fixMessage( node ) {
      node.setAttribute( 'title', node.textContent );

      var matcher = /^Expected (.*?) ((?:not )?to (?:equal|be) )(.*?)\.$/;
      var matches = node.textContent.match( matcher );
      var left = matches[ 1 ];
      var relationText = matches[ 2 ];
      var right = matches[ 3 ];

      var leftValue = parse( left );
      var rightValue = parse( right );

      node.innerHTML = '<pre>Expected\n\n' +
         format( leftValue ) + '\n\n' +
         relationText + '\n\n' +
         format( rightValue ) + '\n' +
      '</pre>';

      var delta = jsondiffpatch.diff( leftValue, rightValue );
      var diffContainer;
      if( delta ) {
         node.className = 'webpack-jasmine-fixup-json-message';
         node.addEventListener( 'click', function() {
            if( diffContainer ) {
               diffContainer.parentNode.removeChild( diffContainer );
               diffContainer = null;
               return;
            }
            diffContainer = document.createElement( 'DIV' );
            diffContainer.innerHTML =
               '<h3>diff:</h3>' + jsondiffpatch.formatters.html.format( delta, leftValue );
            node.appendChild( diffContainer );
         } );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function format( value ) {
      return JSON.stringify( value, null, 3 );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function parse( source ) {
      // Must use eval since Jasmine produces no valid JSON (unquoted object keys, Object constructor)
      try {
         // eslint-disable-next-line no-eval
         return eval( source );
      }
      catch( e ) {
         var msg = 'webpack-jasmine-html-runner-plugin: fixup-json-messages: could not parse message part: ';
         // eslint-disable-next-line no-console
         console.info( msg, source );
         return source;
      }
   }

})();
