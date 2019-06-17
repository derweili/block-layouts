<?php

namespace Derweili\Content_Templates;

/**
 * Register the template
 */

class Templates {

    public static $post_type = 'content-template';


    function run(){
        add_action( 'init', array( $this, 'register_post_type' ) );
        add_action( 'rest_api_init', array( $this, 'add_plain_content_post_data' ) );

    }

    function register_post_type() {
        $args = array(
          'public' => true,
          'label'  => __('Templates', 'content-templates'),
          'show_in_rest' => true
        );
        register_post_type( Templates::$post_type, $args );
    }


    function add_plain_content_post_data() {
        register_rest_field(Templates::$post_type,
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
     

}

$templates = new Templates();
$templates->run();
