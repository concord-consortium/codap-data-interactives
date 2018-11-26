// jscommon.js
// All HTML pages should include this file
// This script contains common javascript functions that should
// be globally accessable.

// namespace placeholder
KCPCommon = {};

// keeps track of which scripts have been included
KCPCommon._includes = new Array();

// Set this variable to the directory where all of your javascripts will
// be placed. for example, includeDir = "/js/"; means that the root directory
// for all of your KCPCommon.include(...) will be the "js" directory.
KCPCommon.includeDir = "";

// Easy way to include additional js files inside a javascript
KCPCommon.include = function(filename)
{	
	if (this._includes[filename] !== 1)
	{
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.src = this.includeDir + "/" + filename;
		script.type = 'text/javascript';
		
		head.appendChild(script);
		this._includes[filename] = 1;
	}
}

// Used to extend one class with another.
//
// For example, 
// KCPCommon.extend(Employee, Person);
//
// In the Employee's constructor, call
// Employee.baseConstructor.call(this, first, last);
KCPCommon.extend = function(subClass, baseClass)
{
	function inheritance() {}
	inheritance.prototype = baseClass.prototype;
	
	subClass.prototype = new inheritance();
	subClass.prototype.constructor = subClass;
	subClass.baseConstructor = baseClass;
	subClass.superClass = baseClass.prototype;
}

if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(elt /*, from*/)
  {
    var len = this.length;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}
KCPCommon.formatCurrency = function( iAmount)
{
  iAmount = parseFloat(iAmount);
  if(isNaN(iAmount)) { iAmount = 0.00; }
  var tResult = Math.round( iAmount * 100) / 100;
  if( iAmount < 0)
    tResult = '-$' + (-tResult);
  else
    tResult = '$' + tResult;
  if(tResult.indexOf('.') == (tResult.length - 2)) { tResult += '0'; }
  return tResult;
}

KCPCommon.setElementVisibility = function(id, visible)
{
	var element = document.getElementById(id);
	if (element)
		element.style.visibility = (visible ? "visible" : "hidden");
}

/**
 *
 * @param iImage  Raphael element
 * @param iNewSrc { src: {String} width: {Number} height: {Number} }
 * @param iCompletionCallback
 */
KCPCommon.switchSrc = function( iImage, iNewSrc, iCompletionCallback) {

  function bringUpNew() {
    iImage.attr( iNewSrc);
    iImage.animate({opacity: 1 }, 200, '>', iCompletionCallback);
  }

  if( iNewSrc.src === iImage.attr('src'))
    return;
  iImage.animate({opacity: 0 }, 200, '<', bringUpNew);
}

/**
  Returns an array of strings representing the property names of the object.
  The order of the returned elements is not specified by the standard.
  Returns an empty array for undefined or null objects.

  @param {Object} iObject   The object whose properties names should be returned
  @returns {Array of String}  Array of property name strings
 */
KCPCommon.keys = function( iObject) {
  return Object.keys( iObject || {});
};

/**
  Applies the specified function to each property of the specified object.
  The order in which the properties are visited is not specified by the standard.

  The function passed to forEach should have the following signature:

  function( iKey, iValue)

  @param {Object}   iObject   The object whose properties should be iterated
  @param {Function} iFunction The function to be called for each entry
 */
KCPCommon.forEach = function( iObject, iFunction) {
  if( !iObject) return;
  for( var tKey in iObject) {
    if( iObject.hasOwnProperty( tKey))
      iFunction( tKey, iObject[ tKey]);
  }
};

/**
 *
 * @param iPt {x, y}
 * @param iRect {left, top, width, height}
 */
KCPCommon.pointInRect = function( iPt, iRect) {
  return (iPt.x >= iRect.left) && (iPt.x <= iRect.left + iRect.width) &&
         (iPt.y >= iRect.top) && (iPt.y <= iRect.top + iRect.height);
};

/**
 *
 * @param iPt {x, y}
 * @param iElement {Raphael element}
 */
KCPCommon.pointInElement = function( iPt, iElement) {
  return this.pointInRect( iPt, { left: iElement.attr('x'), top: iElement.attr('y'),
                                  width: iElement.attr('width'), height: iElement.attr('height')});
};

/**
 * See <http://www.filosophy.org/post/35/normaldistributed_random_values_in_javascript_using_the_ziggurat_algorithm/>
 * Usage
 *  var z = new KCPCommon.randomNormal();
 *  z.nextGaussian(); // Generates random number from distribution mean = 0 and SD = 1
 * @constructor
 */

KCPCommon.randomNormal = function(){

  var jsr = 123456789;

  var wn = Array(128);
  var fn = Array(128);
  var kn = Array(128);

  function RNOR(){
    var hz = SHR3();
    var iz = hz & 127;
    return (Math.abs(hz) < kn[iz]) ? hz * wn[iz] : nfix(hz, iz);
  }

  this.nextGaussian = function(){
    return RNOR();
  }

  function nfix(hz, iz){
    var r = 3.442619855899;
    var r1 = 1.0 / r;
    var x;
    var y;
    while(true){
      x = hz * wn[iz];
      if( iz == 0 ){
        x = (-Math.log(UNI()) * r1);
        y = -Math.log(UNI());
        while( y + y < x * x){
          x = (-Math.log(UNI()) * r1);
          y = -Math.log(UNI());
        }
        return ( hz > 0 ) ? r+x : -r-x;
      }

      if( fn[iz] + UNI() * (fn[iz-1] - fn[iz]) < Math.exp(-0.5 * x * x) ){
         return x;
      }
      hz = SHR3();
      iz = hz & 127;

      if( Math.abs(hz) < kn[iz]){
        return (hz * wn[iz]);
      }
    }
  }

  function SHR3(){
    var jz = jsr;
    var jzr = jsr;
    jzr ^= (jzr << 13);
    jzr ^= (jzr >>> 17);
    jzr ^= (jzr << 5);
    jsr = jzr;
    return (jz+jzr) | 0;
  }

  function UNI(){
    return 0.5 * (1 + SHR3() / -Math.pow(2,31));
  }

  function zigset(){
    // seed generator based on current time
    jsr ^= new Date().getTime();

    var m1 = 2147483648.0;
    var dn = 3.442619855899;
    var tn = dn;
    var vn = 9.91256303526217e-3;

    var q = vn / Math.exp(-0.5 * dn * dn);
    kn[0] = Math.floor((dn/q)*m1);
    kn[1] = 0;

    wn[0] = q / m1;
    wn[127] = dn / m1;

    fn[0] = 1.0;
    fn[127] = Math.exp(-0.5 * dn * dn);

    for(var i = 126; i >= 1; i--){
      dn = Math.sqrt(-2.0 * Math.log( vn / dn + Math.exp( -0.5 * dn * dn)));
      kn[i+1] = Math.floor((dn/tn)*m1);
      tn = dn;
      fn[i] = Math.exp(-0.5 * dn * dn);
      wn[i] = dn / m1;
    }
  }
  zigset();
};
