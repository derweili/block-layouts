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
        // add_action( 'init', array( $this, 'register_post_meta' ), 30 );
        add_action( 'rest_api_init', array( $this, 'add_plain_content_post_data' ) );
        add_action( 'rest_api_init', array( $this, 'add_plain_icon_post_data' ) );
        // add_action( 'rest_api_init', array( $this, 'add_selected_post_types_post_data' ) );
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

    function get_icon_field($post, $field_name, $request) {
      return get_the_post_thumbnail_url( $post->ID, 'full');
    }

    function gutenberg_data(){

        $url = admin_url( 'edit.php?post_type=block-layout' );
        wp_localize_script( 'derweilicontenttemplates-plugin-js', 'templatesAdminLink', $url );

    }

    /**
     * Add selected post types to REST API
     */
    function add_selected_post_types_post_data() {
        register_rest_field(Layouts::$post_type,
            'selected-post-types',
            array(
                'get_callback' => array($this, 'get_selected_post_types_field' ),
                'update_callback' => array($this, 'update_selected_post_types_field' ),
                'schema' => array(
                    'description' => 'Icon URL',
                    'type' => 'array',
                    'context' => array('view')
                )
            )
        );
    }

    function get_selected_post_types_field($post){
        $post_types = get_post_meta($post['id'], 'selected-post-types', false);
        if($post_types) return $post_types;

        return [];
    }

    function update_selected_post_types_field($value, $post, $fieldName){
        error_log(print_r($value, true));
        error_log(print_r($post, true));
        delete_post_meta($post->ID, 'selected-post-types' );
        error_log(print_r('deleted', true));
        
        foreach($value as $v){
            
            add_post_meta($post->ID, 'selected-post-types', $v, false);
        }

        return $value;
    }


    // register custom meta tag field
    function register_post_meta() {
        register_post_meta( 'post', 'selected-post-types', array(
            'object_subtype' => Layouts::$post_type,
            'show_in_rest' => true,
            'single' => true,
            'type' => 'string',
            'auth_callback' => function() {
                return current_user_can( 'edit_posts' );
            }
        ) );
    }

}

$templates = new Layouts();
$templates->run();

add_action('add_meta_boxes', 'Derweili\Block_Layouts\register_layouts_metabox');

function register_layouts_metabox(){
    add_meta_box( 'my-meta-box', 'Post Types', 'Derweili\Block_Layouts\block_layouts_post_type_select_metabox',
    Layouts::$post_type, 'side', 'high', array(
        '__block_editor_compatible_meta_box' => true,
    )
    );

}

function block_layouts_post_type_select_metabox( $post ){

    // Add an nonce field so we can check for it later.
    wp_nonce_field( 'block_layouts_selected_post_types', 'block_layouts_selected_post_types_nonce' );
 
        

    $post_types = get_post_types(array('show_ui' => true ));
    $selected_post_types = get_post_meta( $post->ID, 'selected-post-types', false);
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

function save_metabox_callback( $post_id ) {

     
    // Check if our nonce is set.
    if ( ! isset( $_POST['block_layouts_selected_post_types_nonce'] ) ) {
        return $post_id;
    }
     
    // Check if our nonce is set.
    if ( ! isset( $_POST['selected-post-types'] ) ) {
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
add_action( 'save_post', 'Derweili\Block_Layouts\save_metabox_callback' );

function pre_query($query){

    if( ! defined( 'REST_REQUEST' ) || ! REST_REQUEST ) return;

    if( isset( $_GET['post_type'] ) ) {

        $post_type = sanitize_text_field( $_GET['post_type'] );

        $meta_query_args = array(
            'relation' => 'OR', // Optional, defaults to "AND"
            array(
                'key'     => 'selected-post-types',
                'value'   => $post_type,
                'compare' => '='
            ),
            array(
                'key'     => 'selected-post-types',
                'compare' => 'NOT EXISTS'
            )
        );

        

        $query->set('meta_query', $meta_query_args);

    }

}

add_action( 'pre_get_posts', 'Derweili\Block_Layouts\pre_query' );
