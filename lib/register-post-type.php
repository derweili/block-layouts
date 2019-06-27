<?php

namespace Derweili\Block_Layouts;

/**
 * Register Layouts Post Type
 */
class Layouts {

    /**
     * Post Type name
     */
    public static $post_type = 'block-layout';

    /**
     * Register all Hooks
     */
    function run(){
        add_action( 'init', array( $this, 'register_post_type' ) );
        add_action( 'rest_api_init', array( $this, 'add_plain_content_post_data' ) );
        add_action( 'rest_api_init', array( $this, 'add_plain_icon_post_data' ) );
        add_action("enqueue_block_editor_assets", array( $this, 'gutenberg_data' ) );

    }

    /**
     * Register Post Type
     */
    function register_post_type() {
        $args = array(
          'public' => false,
          'show_ui' => true,
          'label'  => __('Block Layouts', 'block-layouts'),
          'show_in_rest' => true,
          'supports' => array(
              'thumbnail',
              'editor',
              'title'
          )
        );
        register_post_type( Layouts::$post_type, $args );
    }


    /**
     * Add plain content (unfiltered) to REST API
     */
    function add_plain_content_post_data() {
        register_rest_field(Layouts::$post_type,
            'plain_content',
            array(
                'get_callback' => array($this, 'get_plain_content_field' ),
                // 'update_callback' => 'slug_update_field',
                'schema' => array(
                    'description' => 'Plain Content',
                    'type' => 'string',
                    'context' => array('view')
                )
            )
        );
    }


    function get_plain_content_field($post, $field_name, $request) {
      return $post["content"]["raw"];
    }


    /**
     * Add Post Thumnail URL as Icon to REST API
     */
    function add_plain_icon_post_data() {
        register_rest_field(Layouts::$post_type,
            'icon',
            array(
                'get_callback' => array($this, 'get_icon_field' ),
                // 'update_callback' => 'slug_update_field',
                'schema' => array(
                    'description' => 'Icon URL',
                    'type' => 'string',
                    'context' => array('view')
                )
            )
        );
    }


    function get_icon_field($post, $field_name, $request) {
      return get_the_post_thumbnail_url( $post->ID, 'full');
    }

    function gutenberg_data(){

        $url = admin_url( 'edit.php?post_type=block-layout' );
        wp_localize_script( 'derweilicontenttemplates-plugin-js', 'templatesAdminLink', $url );

    }


}

$templates = new Layouts();
$templates->run();
