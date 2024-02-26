import os
import sys
import openai
import json
import argparse

fw_api = os.environ.get("FIREWORKS_API_KEY")


client = openai.OpenAI(
    base_url = "https://api.fireworks.ai/inference/v1",
    api_key = fw_api
)



def func_call(transcript):
    messages = [
        {"role": "system", 
         "content": f"You are a helpful assistant with access to functions." 
         "Use functions all the time."},
        {"role": "user", 
         "content": f"Use the text provided to you and extract the occupation mentioned in the text. {transcript}"
        }
    ]

    tools = [
        {
            "type": "function",
            "function": {
                # name of the function 
                "name": "get_occupation_data",
                # a good, detailed description for what the function is supposed to do
                "description": "Get occupation data from the conversation.",
                # a well defined json schema: https://json-schema.org/learn/getting-started-step-by-step#define
                "parameters": {
                    # for OpenAI compatibility, we always declare a top level object for the parameters of the function
                    "type": "object",
                    # the properties for the object would be any arguments you want to provide to the function
                    "properties": {
                        "occupation": {
                            # JSON Schema supports string, number, integer, object, array, boolean and null
                            # for more information, please check out https://json-schema.org/understanding-json-schema/reference/type
                            "type": "string",
                            # You can restrict the space of possible values in an JSON Schema
                            # you can check out https://json-schema.org/understanding-json-schema/reference/enum for more examples on how enum works
                            "enum": ["engineer", "writer"],
                        },
                    },
                    # You can specify which of the properties from above are required
                    # for more info on `required` field, please check https://json-schema.org/understanding-json-schema/reference/object#required
                    "required": ["occupation"],
                },
            },
        }
    ]

    chat_completion = client.chat.completions.create(
        model="accounts/fireworks/models/firefunction-v1",
        messages=messages,
        tools=tools,
        temperature=0.1
    )
    # print(chat_completion.choices[0].message.model_dump_json(indent=4))

    def get_occupation_data(occupation: str):
        print(f"occupation: {occupation}")
        return {"occupation": occupation, "enemployed": 50000}
        # print(f"{metric=}")
        # if metric == "net_income":
        #     return {"net_income": 6_046_000_000}
        # else:
        #     raise NotImplementedError()

    function_call = chat_completion.choices[0].message.tool_calls[0].function
    # print(function_call)

    tool_response = locals()[function_call.name](**json.loads(function_call.arguments))
    
    return tool_response


    
