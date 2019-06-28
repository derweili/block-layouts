<?php
/**
 * Main plugin file
 *
 * @package     Derweili\Block_Layouts
 * @author      derweili (@derweili)
 * @license     GPL2+
 *
 * @wordpress-plugin
 * Plugin Name: Block Layouts
 * Plugin URI:  https://github.com/derweili/block-layouts
 * Description: Block Layouts for WordPress
 * Version:     1.0.1
 * Author:      Derweili
 * Author URI:  https://derweili.de
 * Text Domain: block-layouts
 * Domain Path: /languages
 * License:     GPL2+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.html
 */

namespace Derweili\Block_Layouts;

//  Exit if accessed directly.
defined('ABSPATH') || exit;

/**
 * Gets this plugin's absolute directory path.
 *
 * @since  2.1.0
 * @ignore
 * @access private
 *
 * @return string
 */
function _get_plugin_directory() {
	return __DIR__;
}

/**
 * Gets this plugin's URL.
 *
 * @since  2.1.0
 * @ignore
 * @access private
 *
 * @return string
 */
function _get_plugin_url() {
	static $plugin_url;

	if ( empty( $plugin_url ) ) {
		$plugin_url = plugins_url( null, __FILE__ );
	}

	return $plugin_url;
}

/**
 * Load plugin textdomain.
 *
 * @since 1.0.0
 */
function load_textdomain() {
	$return = load_plugin_textdomain( 'block-layouts', false, basename( dirname( __FILE__ ) ) . '/languages' ); 
}

add_action( 'plugins_loaded', __NAMESPACE__ . '\load_textdomain' );


// Enqueue JS and CSS
include __DIR__ . '/lib/register-scripts.php';

// Register Post Type
include __DIR__ . '/lib/register-post-type.php';

// Add Meta Info to Plugin
include __DIR__ . '/lib/meta.php';
