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

        // Metabox stuff
        add_action("add_meta_boxes", array( $this, 'register_post_type_select_metabox' ) );
        add_action( 'save_post', array( $this, 'save_metabox_callback' ) );
        add_action( 'pre_get_posts', array( $this, 'filter_rest_api_query' ) );

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
              'title',
              'custom-fields'
          ),
          'rest_controller_class' => 'WP_REST_Posts_Controller'
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

    /**
     * Rest api Icon field callback.
     * 
     * Get post thumnail url in full size
     */
    function get_icon_field($post, $field_name, $request) {
      return get_the_post_thumbnail_url( $post->ID, 'full');
    }

    /**
     * Register variable to access from gutenberg
     * 
     * Register templateAdminLink directing to edit block-layouts screen so we can link to "create new template" from gutenberg sidebar if there are no templates available
     */
    function gutenberg_data(){

        $url = admin_url( 'edit.php?post_type=block-layout' );
        wp_localize_script( 'derweilicontenttemplates-plugin-js', 'templatesAdminLink', $url );

    }

    /**
     * Register Post Type Select metabox for block layouts
     */
    function register_post_type_select_metabox(){
        add_meta_box(
            'block-layouts-post-type-select-metabox', // metabox id
            'Post Types', // metabox title
            array( $this, 'block_layouts_post_type_select_metabox' ), // calback method
            Layouts::$post_type, // post type
            'side', // metabox location
            'high', // metabox priority
            array(
                '__block_editor_compatible_meta_box' => true,
            )
        );
    }

    /**
     * Post Type Select Metabox callback
     * 
     * Metabox Content
     */
    function block_layouts_post_type_select_metabox( $post ){

        // Add an nonce field so we can check for it later.
        wp_nonce_field( 'block_layouts_selected_post_types', 'block_layouts_selected_post_types_nonce' );
     
        // get all post types with a ui (don't show internal post types like menu items)
        $post_types = get_post_types(array('show_ui' => true ));

        // get currently assigned post types from post meta
        $selected_post_types = get_post_meta( $post->ID, 'selected-post-types', false);

        // only show metabox content if we received post types from database
        if($post_types):
        ?>
        <ul>
            <?php foreach($post_types as $pt): $post_type = get_post_type_object( $pt ); 
     ?>
            
                <li>
                    <input 
                            type="checkbox"
                            <?php if( in_array($post_type->name, $selected_post_types) ) echo 'checked'; ?>
                            name="selected-post-types[]"
                            id="post-type-<?php echo $post_type->name; ?>"
                            value="<?php echo $post_type->name; ?>"
                        >
                        
                    <label for="post-type-<?php echo $post_type->name; ?>"><?php echo $post_type->label; ?></label>
                </li>
            <?php endforeach; ?>
        </ul>
        
        <?php
        endif;
    }

    /**
     * Save Metabox values to post meta
     */
    function save_metabox_callback( $post_id ) {

     
        // Check if our nonce is set.
        if ( ! isset( $_POST['block_layouts_selected_post_types_nonce'] ) ) {
            return $post_id;
        }
    
    
        $nonce = $_POST['block_layouts_selected_post_types_nonce'];
     
        // Verify that the nonce is valid.
        if ( ! wp_verify_nonce( $nonce, 'block_layouts_selected_post_types' ) ) {
            return $post_id;
        }
    
        /*
         * If this is an autosave, our form has not been submitted,
         * so we don't want to do anything.
         */
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
            return $post_id;
        }
        
        // Check the user's permissions.
        if ( 'page' == $_POST['post_type'] ) {
            if ( ! current_user_can( 'edit_page', $post_id ) ) {
                return $post_id;
            }
        } else {
            if ( ! current_user_can( 'edit_post', $post_id ) ) {
                return $post_id;
            }
        }
    
        $new_selected_posts = $_POST['selected-post-types'];
    
        delete_post_meta($post_id, 'selected-post-types' );
        
        foreach($new_selected_posts as $v){
            
            add_post_meta($post_id, 'selected-post-types', sanitize_text_field( $v ), false);
        }
         
    }

    /**
     * Filter Block Layouts REST API Query
     * 
     * We need to support a custom query parameter "post_type" to show only block layouts for specific post types.
     */
    function filter_rest_api_query($query){

        // only filter if we are on a rest route
        if( ! defined( 'REST_REQUEST' ) || ! REST_REQUEST ) return;
        
        // only filter if the post_type query parameter is set
        if( isset( $_GET['post_type'] ) ) {
            
            // get value of post_type query parameter
            $post_type = sanitize_text_field( $_GET['post_type'] );
            
            //build meta query. Only query block layouts with specific post type or without any post type assigned
            $meta_query_args = array(
                'relation' => 'OR', // one of these queries must match
                array(  // query block layouts with specific post type assigned
                    'key'     => 'selected-post-types',
                    'value'   => $post_type,
                    'compare' => '='
                ),
                array( // query block layouts without a assigned post type (these block layouts support all post types)
                    'key'     => 'selected-post-types',
                    'compare' => 'NOT EXISTS'
                )
            );
            
            // set meta_query
            $query->set('meta_query', $meta_query_args);
    
        }
    
    }
    

}

$templates = new Layouts();
$templates->run();
