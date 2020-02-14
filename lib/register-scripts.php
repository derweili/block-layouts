<?php

namespace Derweili\Block_Layouts;

$js_dependencies = [ 'wp-plugins', 'wp-element', 'wp-edit-post', 'wp-i18n', 'wp-api-request', 'wp-data', 'wp-components', 'wp-blocks', 'wp-editor', 'wp-compose' ];

// add_action( 'init', __NAMESPACE__ . '\register_block_assets' );
/**
 * Enqueue block editor only JavaScript and CSS.
 */
function register_block_assets() {

	// Make paths variables so we don't write em twice ;)
	$editor_js_path = '/assets/js/blocks.editor.js';
	$editor_style_path = '/assets/css/blocks.editor.css';
	$style_path = '/assets/css/blocks.style.css';

	// Register the bundled block JS file
	wp_register_script(
		'jsforwp-adv-gb-editor-js',
		_get_plugin_url() . $editor_js_path,
		$js_dependencies,
		filemtime( _get_plugin_directory() . $editor_js_path ),
		true
	);	

	// Register editor only styles
	wp_register_style(
		'jsforwp-adv-gb-editor-css',
		_get_plugin_url() . $editor_style_path,
		[],
		filemtime( _get_plugin_directory() . $editor_style_path )
	);
	
	// Register shared editor and frontend styles
	wp_register_style(
		'jsforwp-adv-gb-css',
		_get_plugin_url() . $style_path,
		[],
		filemtime( _get_plugin_directory() . $style_path )
	);

}

/**
 * Enqueue block frontend JS & CSS
 */

error_log('register script file');
function plugin_assets(){
	$plugin_js_path = "/assets/js/plugins.editor.js";
	error_log('plugin assets' . _get_plugin_url() . $plugin_js_path );
	
	wp_enqueue_script(
		"derweilicontenttemplates-plugin-js",
		_get_plugin_url() . $plugin_js_path,
		$js_dependencies,
		filemtime( _get_plugin_directory() . $plugin_js_path ),
		true
	);
	
	$plugin_css_path = "/assets/css/plugins.editor.css";
	wp_enqueue_style(
		"derweilicontenttemplates-plugin-css",
		_get_plugin_url() . $plugin_css_path,
		[],
		filemtime( _get_plugin_directory() . $plugin_css_path )
	);

	wp_localize_script( 'derweilicontenttemplates-plugin-js', 'derweiliBlockLayoutsSupportedPostTypes', get_supported_post_types() );

}

add_action("enqueue_block_editor_assets", __NAMESPACE__ . '\plugin_assets' );

function get_supported_post_types() {
	
	$args = array(
		'show_in_rest' => true // only query post types with REST-API support, because only those can have the block editor enabled
	);

	$supportedPostTypes = get_post_types( $args );

	$supported_post_types_names = [];

	foreach ($supportedPostTypes as $key => $value) {
		$supported_post_types_names[] = $value;
	}

	$supported_post_types_names = apply_filters( 'derweili_block_layouts_supported_post_types', $supported_post_types_names );

	return $supported_post_types_names;
}
