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
         .forEach( fixMessage );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function processToEqual( textContent ) {
      var matcher = /^(Expected )(.*?) ((?:not )?to (?:equal|be) )(.*?)\.$/;
      var matches = textContent.match( matcher );
      return matches && {
         prefix: matches[ 1 ],
         left: matches[ 2 ],
         relationText: matches[ 3 ],
         right: matches[ 4 ]
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function processToHaveBeenCalledWith( textContent ) {
      var matcher =
         /^(Expected spy (?:.*?) (?:not )?to have been called with )(.*)( but actual calls were )(.*)\.$/;
      var matches = textContent.match( matcher );
      return matches && {
         prefix: matches[ 1 ],
         left: matches[ 2 ],
         relationText: matches[ 3 ],
         right: matches[ 4 ]
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function fixMessage( node ) {
      var textContent = node.textContent;

      var match =
         processToEqual( textContent ) ||
         processToHaveBeenCalledWith( textContent );

      if( !match ) {
         return;
      }

      node.setAttribute( 'title', textContent );

      var left = parse( match.left );
      var right = parse( match.right );

      node.innerHTML = [
         '<pre>' + match.prefix,
         format( left ),
         match.relationText,
         format( right ),
         '</pre>'
      ].join( '\n\n' );

      var diffContainer;
      if( left.length !== right.length || jsondiffpatch.diff( left[ 0 ], right[ 0 ] ) ) {
         node.className = 'webpack-jasmine-fixup-json-message';
         node.addEventListener( 'click', function() {
            if( diffContainer ) {
               diffContainer.parentNode.removeChild( diffContainer );
               diffContainer = null;
               return;
            }
            diffContainer = document.createElement( 'DIV' );
            diffContainer.innerHTML = '<h3>diff:</h3>';
            // multiple right values occur e.g. when using toHaveBeenCalledWith
            right.forEach( function( rightItem ) {
               var delta = jsondiffpatch.diff( left[ 0 ], rightItem );
               diffContainer.innerHTML += '<br>' + jsondiffpatch.formatters.html.format( delta, left );
            } );
            node.appendChild( diffContainer );
         } );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function format( value ) {
      // value was wrapped in array for parsing:
      return value.map( function( item ) {
         return JSON.stringify( item, null, 3 );
      } ).join( ',\n' );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function parse( source ) {
      // Must use eval since Jasmine produces no valid JSON (unquoted object keys, Object constructor)
      try {
         // eslint-disable-next-line no-eval
         return eval( '[ ' + source + ' ]' );
      }
      catch( e ) {
         var msg = 'webpack-jasmine-html-runner-plugin: fixup-json-messages: could not parse message part: ';
         // eslint-disable-next-line no-console
         console.info( msg, source );
         return source;
      }
   }

})();
