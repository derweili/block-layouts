<?php
namespace Derweili\Content_Templates;

add_action( 'wp_ajax_copy_from_template', __NAMESPACE__ . '\register_ajax', 40 );
add_action( 'wp_ajax_nopriv_copy_from_template', __NAMESPACE__ . '\register_ajax', 40 );

/**
 * Handle Template Copy
 */
function register_ajax() {

    /**
     * Get Data from Post
     */
    $currentPostId = intval( $_POST['post'] ); // ID of current post
    $templateId = intval( $_POST['template'] ); // ID of template
    $post = get_post($templateId);

    // check if current user can edit this post
    if( ! current_user_can( get_post_type_object($post->post_type)->cap->edit_post, $currentPostId ) ){
        echo json_encode(array(
            'success' => false,
            'template' => 'You are not allowed to edit this post'
        ));
        die();
    }


    current_user_can( $capability , $object_id );

    setup_postdata($post);

    $templateContent = get_the_content();

    $my_post = array(
        'ID'           => $currentPostId,
        'post_content' => $templateContent,
    );
  
  // Update the post into the database
    $updated_post = wp_update_post( $my_post );

    if( is_wp_error( $updated_post ) ){
        echo json_encode(array(
            'success' => false,
            'error' => $updated_post->get_error_message()
        ));
    }else{
        echo json_encode(array(
            'success' => true,
            'template' => $templateContent
        ));
    }
    // var_dump($_POST);
    die();

}